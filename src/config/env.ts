import dotenv from "dotenv";

dotenv.config();

interface Env {
	API_BASE_URL: string;
	CANDIDATE_ID: string;
}

function getRequiredEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export const env: Env = {
	API_BASE_URL: getRequiredEnv("API_BASE_URL"),
	CANDIDATE_ID: getRequiredEnv("CANDIDATE_ID"),
};
