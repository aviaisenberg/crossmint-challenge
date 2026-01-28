import {
	MegaverseApiConfig,
	Position,
	SoloonColor,
	ComethDirection,
	PolyanetResponse,
	SoloonResponse,
	ComethResponse,
	DeleteResponse,
	ApiErrorResponse,
} from "../types/megaverse";

import {
	MegaverseError,
	NetworkError,
	ValidationError,
	NotFoundError,
	AuthenticationError,
	RateLimitError,
	ServerError,
} from "../errors/megaverse-error";

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export class MegaverseAPI {
	private readonly baseUrl: string;
	private readonly candidateId: string;
	private readonly timeout: number;
	private readonly retryCount: number;
	private readonly retryDelay: number;

	constructor(config: MegaverseApiConfig) {
		if (!config.baseUrl) {
			throw new ValidationError("baseUrl is required");
		}
		if (!config.candidateId) {
			throw new ValidationError("candidateId is required");
		}

		// Remove trailing slash from baseUrl if present
		this.baseUrl = config.baseUrl.replace(/\/$/, "");
		this.candidateId = config.candidateId;
		this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
		this.retryCount = config.retryCount ?? DEFAULT_RETRY_COUNT;
		this.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
	}

	public async createPolyanet(position: Position): Promise<PolyanetResponse> {
		this.validatePosition(position);

		const response = await this.makeRequest<PolyanetResponse>(
			"/polyanets",
			"POST",
			{
				candidateId: this.candidateId,
				row: position.row,
				column: position.column,
			},
		);

		return response;
	}

	public async deletePolyanet(position: Position): Promise<DeleteResponse> {
		this.validatePosition(position);

		const response = await this.makeRequest<DeleteResponse>(
			"/polyanets",
			"DELETE",
			{
				candidateId: this.candidateId,
				row: position.row,
				column: position.column,
			},
		);

		return response;
	}

	public async createSoloon(
		position: Position,
		color: SoloonColor,
	): Promise<SoloonResponse> {
		this.validatePosition(position);
		this.validateSoloonColor(color);

		const response = await this.makeRequest<SoloonResponse>(
			"/soloons",
			"POST",
			{
				candidateId: this.candidateId,
				row: position.row,
				column: position.column,
				color,
			},
		);

		return response;
	}

	public async deleteSoloon(position: Position): Promise<DeleteResponse> {
		this.validatePosition(position);

		const response = await this.makeRequest<DeleteResponse>(
			"/soloons",
			"DELETE",
			{
				candidateId: this.candidateId,
				row: position.row,
				column: position.column,
			},
		);

		return response;
	}

	public async createCometh(
		position: Position,
		direction: ComethDirection,
	): Promise<ComethResponse> {
		this.validatePosition(position);
		this.validateComethDirection(direction);

		const response = await this.makeRequest<ComethResponse>(
			"/comeths",
			"POST",
			{
				candidateId: this.candidateId,
				row: position.row,
				column: position.column,
				direction,
			},
		);

		return response;
	}

	public async deleteCometh(position: Position): Promise<DeleteResponse> {
		this.validatePosition(position);

		const response = await this.makeRequest<DeleteResponse>(
			"/comeths",
			"DELETE",
			{
				candidateId: this.candidateId,
				row: position.row,
				column: position.column,
			},
		);

		return response;
	}

	private async makeRequest<T>(
		endpoint: string,
		method: "POST" | "DELETE",
		body: Record<string, unknown>,
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		let lastError: Error | null = null;

		// Retry loop
		for (let attempt = 1; attempt <= this.retryCount; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(
					() => controller.abort(),
					this.timeout,
				);

				const response = await fetch(url, {
					method,
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				// Handle the response
				return await this.handleResponse<T>(response);
			} catch (error) {
				lastError = error as Error;

				// Don't retry on validation or auth errors
				if (
					error instanceof ValidationError ||
					error instanceof AuthenticationError ||
					error instanceof NotFoundError
				) {
					throw error;
				}

				// Check if we should retry
				if (attempt < this.retryCount) {
					// Handle rate limiting with exponential backoff
					const delay =
						error instanceof RateLimitError && error.retryAfter
							? error.retryAfter * 1000
							: this.retryDelay * Math.pow(2, attempt - 1);

					console.warn(
						`Request failed (attempt ${attempt}/${this.retryCount}), retrying in ${delay}ms...`,
					);
					await this.sleep(delay);
				}
			}
		}

		// All retries exhausted
		throw new NetworkError(
			`Request failed after ${this.retryCount} attempts: ${lastError?.message}`,
			lastError ?? undefined,
		);
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		let responseData: T | ApiErrorResponse | null = null;

		try {
			const text = await response.text();
			if (text) {
				responseData = JSON.parse(text);
			}
		} catch {
			// Response body is not valid JSON, continue with null
		}

		// Handle successful responses
		if (response.ok) {
			return (responseData ?? { success: true }) as T;
		}

		// Handle error responses based on status code
		const errorResponse = responseData as ApiErrorResponse;
		const errorMessage =
			errorResponse?.error ||
			errorResponse?.message ||
			`Request failed with status ${response.status}`;

		switch (response.status) {
			case 400:
				throw new ValidationError(errorMessage, undefined, 400);
			case 401:
			case 403:
				throw new AuthenticationError(errorMessage);
			case 404:
				throw new NotFoundError(errorMessage);
			case 429:
				const retryAfter = response.headers.get("Retry-After");
				throw new RateLimitError(
					errorMessage,
					retryAfter ? parseInt(retryAfter, 10) : undefined,
				);
			case 500:
			case 502:
			case 503:
			case 504:
				throw new ServerError(errorMessage, response.status);
			default:
				throw new MegaverseError(
					errorMessage,
					response.status,
					errorResponse,
				);
		}
	}

	private validatePosition(position: Position): void {
		if (
			typeof position.row !== "number" ||
			position.row < 0 ||
			!Number.isInteger(position.row)
		) {
			throw new ValidationError(
				"Row must be a non-negative integer",
				"row",
			);
		}

		if (
			typeof position.column !== "number" ||
			position.column < 0 ||
			!Number.isInteger(position.column)
		) {
			throw new ValidationError(
				"Column must be a non-negative integer",
				"column",
			);
		}
	}

	private validateSoloonColor(color: SoloonColor): void {
		const validColors: SoloonColor[] = ["blue", "red", "purple", "white"];
		if (!validColors.includes(color)) {
			throw new ValidationError(
				`Invalid Soloon color: ${color}. Must be one of: ${validColors.join(", ")}`,
				"color",
			);
		}
	}

	private validateComethDirection(direction: ComethDirection): void {
		const validDirections: ComethDirection[] = [
			"up",
			"down",
			"right",
			"left",
		];
		if (!validDirections.includes(direction)) {
			throw new ValidationError(
				`Invalid Cometh direction: ${direction}. Must be one of: ${validDirections.join(", ")}`,
				"direction",
			);
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
