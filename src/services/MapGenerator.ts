import { MegaverseAPI } from "./MegaverseApi";
import { ComethDirection, GoalMap, SoloonColor } from "../types";

export class MapGenerator {
	private megaverseAPI: MegaverseAPI;

	constructor(megaverseAPI: MegaverseAPI) {
		this.megaverseAPI = megaverseAPI;
	}

	public async generateXMap(n: number, margin: number) {
		const coords = this.generateInnerXCoords(n, margin);
		console.log(`Generating map with ${coords.length} polyanets`);
		console.log(coords);
		for (const coord of coords) {
			console.log(`Creating polyanet at ${coord.row}, ${coord.column}`);
			await this.megaverseAPI.createPolyanet(coord);
		}
		return coords;
	}

	/**
	 * Fetches the goal map from the API and generates all astral objects
	 * to match the target configuration
	 */
	public async generateGoalMap(): Promise<void> {
		// Fetch the goal map from the API
		console.log("Fetching goal map from API...");
		const goalMap: GoalMap = await this.megaverseAPI.getGoalMap();
		console.log(
			`Goal map fetched: ${goalMap.length}x${goalMap[0]?.length || 0} grid`,
		);

		// Traverse the map and invoke the correct API method for each element
		for (let row = 0; row < goalMap.length; row++) {
			for (let column = 0; column < goalMap[row].length; column++) {
				const cell = goalMap[row][column];

				switch (cell) {
					case "POLYANET":
						console.log(`Creating polyanet at ${row}, ${column}`);
						await this.megaverseAPI.createPolyanet({
							row,
							column,
						});
						break;
					case "RED_SOLOON":
					case "BLUE_SOLOON":
					case "PURPLE_SOLOON":
					case "WHITE_SOLOON":
						const color = cell.split("_")[0].toLowerCase();
						console.log(
							`Creating soloon (${color}) at ${row}, ${column}`,
						);
						await this.megaverseAPI.createSoloon(
							{
								row,
								column,
							},
							color as SoloonColor,
						);
						break;
					case "UP_COMETH":
					case "DOWN_COMETH":
					case "LEFT_COMETH":
					case "RIGHT_COMETH":
						const direction = cell.split("_")[0].toLowerCase();
						console.log(
							`Creating cometh (${direction}) at ${row}, ${column}`,
						);
						await this.megaverseAPI.createCometh(
							{
								row,
								column,
							},
							direction as ComethDirection,
						);
						break;
					case "SPACE":
					default:
						// Do nothing for empty/space tiles
						break;
				}
			}
		}
	}

	/**
	 * Generate 0-based coordinates for an X on an N x N grid,
	 * but only within the inner square (excluding a border "margin").
	 */
	private generateInnerXCoords(
		n: number,
		margin: number,
	): { row: number; column: number }[] {
		if (!Number.isInteger(n) || n <= 0)
			throw new Error("n must be a positive integer");
		if (!Number.isInteger(margin) || margin < 0)
			throw new Error("margin must be a non-negative integer");
		if (2 * margin >= n) throw new Error("margin too large for grid size");

		const innerN = n - 2 * margin; // 7 when n=11, margin=2
		const coords = [];

		for (let i = 0; i < innerN; i++) {
			const r = margin + i;

			// main diagonal within inner square
			const c1 = margin + i;
			coords.push({ row: r, column: c1 });

			// anti-diagonal within inner square (skip duplicate center)
			const c2 = margin + (innerN - 1 - i);
			if (c2 !== c1) coords.push({ row: r, column: c2 });
		}

		return coords;
	}
}
