/**
 * Type definitions for the Megaverse API
 * Contains all interfaces for requests, responses, and entity types
 */

export type SoloonColor = "blue" | "red" | "purple" | "white";

export type ComethDirection = "up" | "down" | "right" | "left";

export type AstralObjectType = "polyanet" | "soloon" | "cometh";

export interface Position {
	row: number;
	column: number;
}

export interface BaseRequestParams {
	candidateId: string;
}

export interface PolyanetRequest extends BaseRequestParams, Position {}

export interface SoloonRequest extends BaseRequestParams, Position {
	color: SoloonColor;
}

export interface ComethRequest extends BaseRequestParams, Position {
	direction: ComethDirection;
}

export interface DeleteRequest extends BaseRequestParams, Position {}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
}

export interface PolyanetResponse extends ApiResponse {
	data?: {
		id?: string;
		row: number;
		column: number;
	};
}

export interface SoloonResponse extends ApiResponse {
	data?: {
		id?: string;
		row: number;
		column: number;
		color: SoloonColor;
	};
}

export interface ComethResponse extends ApiResponse {
	data?: {
		id?: string;
		row: number;
		column: number;
		direction: ComethDirection;
	};
}

export interface DeleteResponse extends ApiResponse {
	data?: {
		deleted: boolean;
	};
}

export interface ApiErrorResponse {
	error?: string;
	message?: string;
	statusCode?: number;
}

export interface MegaverseApiConfig {
	baseUrl: string;
	candidateId: string;
	timeout?: number;
	retryCount?: number;
	retryDelay?: number;
}
