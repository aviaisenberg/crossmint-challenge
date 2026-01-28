/**
 * Custom error classes for the Megaverse API
 * Provides structured error handling that can be extended
 */

import { ApiErrorResponse } from "../types/megaverse";

/**
 * Base error class for all Megaverse API errors
 * Extend this class for more specific error types
 */
export class MegaverseError extends Error {
	/** HTTP status code if available */
	public readonly statusCode?: number;

	/** Original error response from the API */
	public readonly apiResponse?: ApiErrorResponse;

	/** Timestamp when the error occurred */
	public readonly timestamp: Date;

	constructor(
		message: string,
		statusCode?: number,
		apiResponse?: ApiErrorResponse,
	) {
		super(message);
		this.name = "MegaverseError";
		this.statusCode = statusCode;
		this.apiResponse = apiResponse;
		this.timestamp = new Date();

		// Maintains proper stack trace for where error was thrown
		Error.captureStackTrace(this, this.constructor);
	}

	/**
	 * Returns a formatted string representation of the error
	 */
	public toString(): string {
		let errorStr = `[${this.name}] ${this.message}`;
		if (this.statusCode) {
			errorStr += ` (Status: ${this.statusCode})`;
		}
		return errorStr;
	}

	/**
	 * Returns a JSON-serializable object representation
	 */
	public toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			statusCode: this.statusCode,
			apiResponse: this.apiResponse,
			timestamp: this.timestamp.toISOString(),
		};
	}
}

/**
 * Error thrown when the API request fails due to network issues
 */
export class NetworkError extends MegaverseError {
	constructor(message: string, originalError?: Error) {
		super(message);
		this.name = "NetworkError";

		if (originalError) {
			this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
		}
	}
}

/**
 * Error thrown when the API returns a validation error
 */
export class ValidationError extends MegaverseError {
	/** Field that caused the validation error */
	public readonly field?: string;

	constructor(message: string, field?: string, statusCode?: number) {
		super(message, statusCode);
		this.name = "ValidationError";
		this.field = field;
	}
}

/**
 * Error thrown when the API returns a 404 Not Found
 */
export class NotFoundError extends MegaverseError {
	constructor(message: string = "Resource not found") {
		super(message, 404);
		this.name = "NotFoundError";
	}
}

/**
 * Error thrown when the API returns a 401 or 403
 */
export class AuthenticationError extends MegaverseError {
	constructor(message: string = "Authentication failed") {
		super(message, 401);
		this.name = "AuthenticationError";
	}
}

/**
 * Error thrown when the API rate limits the request
 */
export class RateLimitError extends MegaverseError {
	/** Time to wait before retrying (in seconds) */
	public readonly retryAfter?: number;

	constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
		super(message, 429);
		this.name = "RateLimitError";
		this.retryAfter = retryAfter;
	}
}

/**
 * Error thrown when the API returns a 5xx server error
 */
export class ServerError extends MegaverseError {
	constructor(
		message: string = "Server error occurred",
		statusCode: number = 500,
	) {
		super(message, statusCode);
		this.name = "ServerError";
	}
}
