# Megaverse Challenge

A TypeScript solution for the Crossmint Megaverse coding challenge. This application interacts with the Megaverse API to create astral objects (Polyanets, Soloons, and Comeths) on a 2D map.

## Overview

The Megaverse is a 2D space that can be populated with three types of astral objects:

- **Polyanets** - Basic celestial objects placed at specific coordinates
- **Soloons** - Colored moons that orbit Polyanets (blue, red, purple, or white)
- **Comeths** - Comets with directional trails (up, down, left, or right)

The application fetches the target goal map from the API and automatically creates all the required astral objects to match the configuration.

## Project Structure

```
megaverse/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── errors/
│   │   ├── megaverse-error.ts  # Custom error classes
│   │   └── index.ts
│   ├── services/
│   │   ├── MegaverseApi.ts     # API client for Megaverse endpoints
│   │   ├── MapGenerator.ts     # Map generation logic
│   │   └── index.ts
│   ├── types/
│   │   ├── megaverse.ts        # TypeScript interfaces and types
│   │   └── index.ts
│   └── index.ts                # Application entry point
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment file
├── nodemon.json                # Nodemon configuration
├── package.json
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/aviaisenberg/crossmint-challenge.git
    cd megaverse
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create your environment file:

    ```bash
    cp .env.example .env
    ```

4. Update `.env` with your credentials:
    ```
    API_BASE_URL=https://challenge.crossmint.io
    CANDIDATE_ID=your-candidate-id-here
    ```

## Usage

### Generate the Goal Map

Run the application to fetch the goal map from the API and generate all astral objects:

```bash
npm run dev
```

Or build and run:

```bash
npm run build
npm start
```

## API Client

The `MegaverseAPI` class provides methods for all Megaverse API endpoints:

```typescript
import { MegaverseAPI } from "./services";

const api = new MegaverseAPI({
	baseUrl: "https://challenge.crossmint.io",
	candidateId: "your-candidate-id",
	timeout: 30000,
	retryCount: 10,
	retryDelay: 1000,
});

// Fetch the goal map
const goalMap = await api.getGoalMap();

// Create a Polyanet
await api.createPolyanet({ row: 0, column: 0 });

// Create a Soloon with color
await api.createSoloon({ row: 1, column: 1 }, "blue");

// Create a Cometh with direction
await api.createCometh({ row: 2, column: 2 }, "up");

// Delete operations
await api.deletePolyanet({ row: 0, column: 0 });
await api.deleteSoloon({ row: 1, column: 1 });
await api.deleteCometh({ row: 2, column: 2 });
```

### API Methods

| Method                              | Description                                   |
| ----------------------------------- | --------------------------------------------- |
| `getGoalMap()`                      | Fetches the target goal map for the candidate |
| `createPolyanet(position)`          | Creates a Polyanet at the specified position  |
| `deletePolyanet(position)`          | Deletes a Polyanet at the specified position  |
| `createSoloon(position, color)`     | Creates a Soloon with the specified color     |
| `deleteSoloon(position)`            | Deletes a Soloon at the specified position    |
| `createCometh(position, direction)` | Creates a Cometh with the specified direction |
| `deleteCometh(position)`            | Deletes a Cometh at the specified position    |

### Features

- **Dynamic Goal Map** - Fetches the target map configuration from the API
- **Automatic Retry** - Configurable retry count with exponential backoff
- **Rate Limit Handling** - Respects `Retry-After` headers
- **Type Safety** - Full TypeScript support with interfaces for all requests/responses
- **Error Handling** - Custom error classes for different failure scenarios

## Error Handling

The application includes specialized error classes:

| Error Class           | Description                 |
| --------------------- | --------------------------- |
| `MegaverseError`      | Base error class            |
| `NetworkError`        | Network/connectivity issues |
| `ValidationError`     | Invalid parameters          |
| `NotFoundError`       | 404 errors                  |
| `AuthenticationError` | 401/403 errors              |
| `RateLimitError`      | 429 rate limit errors       |
| `ServerError`         | 5xx server errors           |

## Scripts

| Script          | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start with hot-reload (nodemon) |
| `npm run build` | Compile TypeScript              |
| `npm start`     | Run compiled application        |
| `npm run clean` | Remove dist folder              |

## Technologies

- TypeScript
- Node.js
- dotenv (environment configuration)
- nodemon (development hot-reload)

## License

ISC
