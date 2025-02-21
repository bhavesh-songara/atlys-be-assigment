# Product Stall Scraper

A web scraper application for Product Stall.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Build

To build the project:

```bash
npm run build
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run build` - Build the project
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
.
├── src/
│   ├── app.ts        # Express app setup
│   └── server.ts     # Server entry point
├── dist/             # Compiled output
└── package.json
```

## License

ISC
