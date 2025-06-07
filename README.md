# Web Danmu Backend

This is the backend server for a web-based danmu system. It uses:

- Express for REST API
- WebSocket for real-time communication
- MongoDB Atlas for data persistence

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` file

Copy from `.env.example` and fill in your MongoDB Atlas URI:

```bash
cp .env.example .env
```

### 3. Start server

```bash
node server.js
```

## Deployment

Can be deployed on [Render](https://render.com) or any Node.js compatible platform.

- Ensure environment variable `MONGODB_URI` is set
- Default port is 3000 or `process.env.PORT`

## API

- `GET /history` – Returns last 50 danmu messages

WebSocket endpoint is the same as the server address.
