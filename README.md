# AetherPress Prototype

Welcome to the AetherPress prototype! This project demonstrates the foundational architecture for a quick-build prototype of AetherPress, focusing on the core loop: Prompt -> AI Processing -> Preview -> Basic Override -> PDF Export.

## Unified Testing & Module System (Summary)

- **Frontend tests:** Powered by Jest for seamless React development.
- **Backend tests:** Powered by Vitest for fast, modern Node.js/TypeScript workflows.
- **Module System:** ES Modules (ESM) are used everywhere for native async/await, better optimization, and consistent import/export syntax across the stack.

For details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Project Structure

- `/backend` — All backend code (Express server, modules, templates)
- `/frontend` — React frontend
- `/data` — SQLite database
- `/samples` — Sample files (e.g., PNGs, PDFs)

## Features

- **Prompt Handling**: Accept user input for AI processing.
- **AI Processing**: Simulated AI content generation using hardcoded logic.
- **Preview Generation**: Basic HTML preview of generated content.
- **Basic Override**: Minimal user edits to the generated content.
- **PDF Export**: Generate PDFs using pdf-lib (prototype) with planned migration to Puppeteer for production to support advanced HTML rendering and layouts.
- **Database Integration**: SQLite database for storing and retrieving content.
- **Frontend Integration**: React-based frontend for interacting with the backend API.
- **AI Service Abstraction Layer**: Centralized logic for text and image generation.
- **Template-Based Layouts**: Dynamic HTML/CSS templates for content and image rendering.

## Getting Started

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   (This runs the Express server from `/backend/index.js`.)

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

## API Endpoints

### 1. Prompt Handling

**POST /prompt**

- Accepts a `prompt` in the request body and returns generated content.

### 2. Preview Generation

**GET /preview**

- Accepts `content` as a query parameter and returns an HTML preview.

### 3. Basic Override

**POST /override**

- Accepts `content` and `override` in the request body and returns updated content.

### 4. PDF Export

**GET /export**

- Accepts `content` as a query parameter and returns a PDF file.

### 5. Database Test

**GET /test-db**

- Saves a test key-value pair to the database and retrieves it to verify database functionality.

## Future Enhancements

- Implement asynchronous processing for better performance.
- Enhance the UI for a more interactive user experience.
- Integrate real AI services for text and image generation.
- Add user authentication and session management.
- Expand database schema for more complex workflows.

## Implementation Notes

### PDF Generation Strategy

- **Prototype**: Using pdf-lib for lightweight PDF generation
  - Simpler implementation
  - ES Module compatible
  - Basic text and layout support
- **Production**: Planned migration to Puppeteer
  - Advanced HTML rendering
  - Custom layouts and styling
  - Full template support
  - Rich media integration
