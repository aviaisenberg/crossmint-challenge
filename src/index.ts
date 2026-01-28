/**
 * Main application entry point
 * Demonstrates usage of the MegaverseAPI client
 */

import { env } from "./config/env";
import { MegaverseAPI, MapGenerator } from "./services";

/**
 * Creates and returns a configured MegaverseAPI instance
 * @returns Configured MegaverseAPI client
 */
export function createMegaverseApiClient(): MegaverseAPI {
	return new MegaverseAPI({
		baseUrl: env.API_BASE_URL,
		candidateId: env.CANDIDATE_ID,
		timeout: 30000,
		retryCount: 10,
		retryDelay: 1000,
	});
}

/**
 * Main application function
 */
async function main(): Promise<void> {
	console.log("Starting Megaverse application...");
	console.log(`Candidate ID: ${env.CANDIDATE_ID}`);

	// Create the API client
	const megaverseApiClient = createMegaverseApiClient();
	const mapGenerator = new MapGenerator(megaverseApiClient);

	await mapGenerator.generateGoalMap();

	console.log("Megaverse application completed successfully");
}

// Run the main function and handle any errors
main().catch((error: Error) => {
	console.error("Application failed to start:", error.message);
	process.exit(1);
});
