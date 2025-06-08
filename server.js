const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Danmu = mongoose.model('Danmu', new mongoose.Schema({
  text: String,
  color: String,
  timestamp: { type: Date, default: Date.now },
}));

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', ws => {
  clients.push(ws);

  ws.on('message', async message => {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      data = { text: message.toString(), color: '#ffffff' };
    }

    const danmu = new Danmu({ text: data.text, color: data.color || '#ffffff' });
    await danmu.save();

    const payload = JSON.stringify({ text: data.text, color: data.color || '#ffffff' });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

app.get('/history', async (req, res) => {
  const data = await Danmu.find().sort({ timestamp: -1 }).limit(50);
  res.json(data.reverse());
});

app.post('/clear', async (req, res) => {
  const providedSecret = req.headers['x-admin-secret'];
  if (providedSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Danmu.deleteMany({});
  res.sendStatus(200);
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
