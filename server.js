const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Mongoose schema and model
const Danmu = mongoose.model('Danmu', new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
}));

// Initialize Express app
const app = express();
app.use(cors()); // Enable CORS for all origins

// Create HTTP and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

// WebSocket connection logic
wss.on('connection', ws => {
  clients.push(ws);

  ws.on('message', async message => {
    const d = new Danmu({ text: message });
    await d.save();

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

// REST endpoint for history
app.get('/history', async (req, res) => {
  const data = await Danmu.find().sort({ timestamp: -1 }).limit(50);
  res.json(data.reverse());
});

// Start server
server.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
