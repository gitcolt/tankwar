const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist'), './index.html');
});

io.on('connection', socket => {
  console.log('a user connected');
});

server.listen(3000, _ => {
  console.log('listening on *:3000');
});
