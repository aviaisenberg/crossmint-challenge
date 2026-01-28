/**
 * Main application entry point
 * Demonstrates usage of the MegaverseAPI client
 */

import { env } from "./config/env";
import { MegaverseAPI } from "./services/megaverse";
import { MegaverseError } from "./errors/megaverse-error";

/**
 * Creates and returns a configured MegaverseAPI instance
 * @returns Configured MegaverseAPI client
 */
export function createApiClient(): MegaverseAPI {
	return new MegaverseAPI({
		baseUrl: env.API_BASE_URL,
		candidateId: env.CANDIDATE_ID,
		timeout: 30000,
		retryCount: 3,
		retryDelay: 1000,
	});
}

/**
 * Main application function
 */
async function main(): Promise<void> {
	console.log("Starting Megaverse application...");
	console.log(`API Base URL: ${env.API_BASE_URL}`);
	console.log(`Candidate ID: ${env.CANDIDATE_ID}`);

	// Create the API client
	const api = createApiClient();

	// Example: Demonstrate API client is ready
	try {
		// Create a Polyanet at position (0, 0)
		const polyanetResult = await api.createPolyanet({ row: 0, column: 0 });
		console.log("Created Polyanet:", polyanetResult);
	} catch (error) {
		if (error instanceof MegaverseError) {
			console.error("Megaverse API Error:", error.toString());
		} else {
			throw error;
		}
	}

	console.log("MegaverseAPI client initialized successfully");
}

// Run the main function and handle any errors
main().catch((error: Error) => {
	console.error("Application failed to start:", error.message);
	process.exit(1);
});
