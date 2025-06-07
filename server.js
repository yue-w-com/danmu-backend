const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schema and model
const Danmu = mongoose.model('Danmu', new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
}));

// Create Express app and enable CORS
const app = express();
app.use(cors());

// Create server and WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

// Handle WebSocket connections
wss.on('connection', ws => {
  clients.push(ws);
  ws.on('message', async message => {
    const d = new Danmu({ text: message });
    await d.save();
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  });
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

// HTTP endpoint for history
app.get('/history', async (req, res) => {
  const data = await Danmu.find().sort({ timestamp: -1 }).limit(50);
  res.json(data.reverse());
});

// Start server
server.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
