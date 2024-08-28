import { Server } from "socket.io";
import express from "express";
import * as http from "http";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

const clientPort = 3000;
const io = new Server(server, {
    cors: {
        origin: `http://localhost:${clientPort}`,
        methods: ["GET", "POST"]
      }
});

const serverPort = 3000;
server.listen(serverPort, () => {
  console.log(`Server is running on http://localhost:${serverPort}`);
});

const clientList = {};

io.on('connect', socket => {
  const player = socket.id;
  const setRange = 7;

  const initX = 2 + Math.floor(Math.random() * setRange);
  for (const key in clientList) {
    if (key === initX) initX += 1;
  }
  
  let posistionX = initX;
  clientList[player] = posistionX;

  socket.emit('playerSet', clientList);
  socket.broadcast.emit('playerSet', clientList);

  console.log(`New player ${player} is connected! (${clientList[player]})`);
  console.log(`Current number of players: " + ${Object.keys(clientList).length}`);
  console.log(``);
  
  socket.on('position', position => {
    clientList[player] = position;
    socket.broadcast.emit('updatePlayer', clientList);
  });  

  socket.on('disconnect', () => {
    const outPlayer = socket.id;

    if (!clientList[outPlayer]) {
      console.warn(`No player found for socket ID: ${outPlayer}`);
      return;
    }
    
    delete clientList[outPlayer];
    socket.broadcast.emit('playerSet', clientList);

    console.log(`${outPlayer} is disconnected!`);
    console.log(`Current number of players: " + ${Object.keys(clientList).length}`);
    console.log(``);
  });
});