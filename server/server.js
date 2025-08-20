import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from "url";
import Game from './src/game.js';
import dotenv from 'dotenv';
import { getLocalIp, showQRCode } from "./src/services/network.js";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Serve the built React client
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Single shared game instance
const game = new Game();

// Helper function to broadcast game state to all players
function broadcastGameState() {
  // Send public state to all players
  io.to('table').emit('room_state', game.getPublicState());
  
  // Send private state to each player
  game.players.forEach(player => {
    if (player.connected) {
      const privateState = game.getPlayerState(player.id);
      io.to(player.id).emit('private_state', {
        holeCards: player.hole,
        validActions: privateState.validActions
      });
    }
  });
}

// Helper function to validate minimum players for actions
function validateMinimumPlayers(callback) {
  const connectedPlayers = game.players.filter(p => p.connected);
  if (connectedPlayers.length < 2) {
    callback && callback({ ok: false, error: 'Need at least 2 players' });
    return false;
  }
  return true;
}

// Handler factories for socket events
function handleJoin(socket) {
  return ({ name }, callback) => {
    try {
      const player = game.addPlayer(socket.id, name);
      socket.join('table');
      
      console.log(`Player ${player.name} joined the table`);
      broadcastGameState();
      
      callback && callback({ 
        ok: true, 
        playerId: player.id,
        playerName: player.name
      });
    } catch (error) {
      console.error('Error joining game:', error);
      callback && callback({ ok: false, error: error.message });
    }
  };
}

function handleStartHand(socket) {
  return (callback) => {
    try {
      if (!validateMinimumPlayers(callback)) return;
      
      // Check if a hand is already in progress
      if (game.phase !== 'waiting') {
        callback && callback({ ok: false, error: 'Hand already in progress' });
        return;
      }

      game.startHand();
      console.log('New hand started');
      
      broadcastGameState();
      
      callback && callback({ ok: true });
    } catch (error) {
      console.error('Error starting hand:', error);
      callback && callback({ ok: false, error: error.message });
    }
  };
}

function handleAction(socket) {
  return ({ action, amount }, callback) => {
    try {
      // Validate it's the player's turn
      const player = game.players.find(p => p.id === socket.id);
      if (!player) {
        callback && callback({ ok: false, error: 'Player not found' });
        return;
      }

      // Execute the action
      game.playerAction(socket.id, action, amount);
      
      console.log(`${player.name} ${action}${amount ? ` ${amount}` : ''}`);

      // Broadcast updated game state
      broadcastGameState();

      // If there was a showdown, emit the results
      if (game.lastShowdown) {
        io.to('table').emit('showdown', game.lastShowdown);
        console.log('Showdown results:', game.lastShowdown);
      }

      callback && callback({ ok: true });
    } catch (error) {
      console.error('Error processing action:', error);
      callback && callback({ ok: false, error: error.message });
    }
  };
}

function handleGetState(socket) {
  return (callback) => {
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      const playerState = game.getPlayerState(socket.id);
      callback && callback(playerState);
    } else {
      callback && callback(game.getPublicState());
    }
  };
}

function handleGetActions(socket) {
  return (callback) => {
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      const playerState = game.getPlayerState(socket.id);
      callback && callback({ validActions: playerState.validActions });
    } else {
      callback && callback({ validActions: [] });
    }
  };
}

function handleResetGame(socket) {
  return ({ password }, callback) => {
    try {
      if (!password || password !== process.env.ADMIN_PASSWORD) {
        callback && callback({ ok: false, error: 'Unauthorized: Invalid admin password' });
        return;
      }
      
      // Reset game state but keep connected players
      const connectedPlayers = game.players.filter(p => p.connected);
      game.players = connectedPlayers;
      game.phase = 'waiting';
      game.pot = 0;
      game.sidePots = [];
      game.community = [];
      game.currentBet = 0;
      game.lastShowdown = null;
      
      // Reset player states
      game.players.forEach(p => {
        p.folded = false;
        p.hole = [];
        p.betThisRound = 0;
        p.allIn = false;
        p.chips = 1000; // Reset chips
      });

      console.log('Game reset');
      broadcastGameState();
      
      callback && callback({ ok: true });
    } catch (error) {
      console.error('Error resetting game:', error);
      callback && callback({ ok: false, error: error.message });
    }
  };
}

function handleDisconnect(socket) {
  return () => {
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      console.log(`Player ${player.name} disconnected`);
      player.connected = false;
      
      // If it was their turn and hand is in progress, fold them
      if (game.phase !== 'waiting' && game.currentPlayerIndex === game.players.indexOf(player)) {
        try {
          if (!player.folded && !player.allIn) {
            game.playerAction(socket.id, 'fold');
            console.log(`Auto-folded disconnected player ${player.name}`);
          }
        } catch (error) {
          console.error('Error auto-folding disconnected player:', error);
        }
      }
      
      // Clean up player after a delay to allow reconnection
      setTimeout(() => {
        const stillDisconnected = game.players.find(p => p.id === socket.id && !p.connected);
        if (stillDisconnected) {
          game.removePlayer(socket.id);
          console.log(`Removed player ${player.name} after timeout`);
          broadcastGameState();
        }
      }, 30000); // 30 second grace period for reconnection
      
      broadcastGameState();
    }
  };
}

function handleReconnect(socket) {
  return ({ playerId, name }, callback) => {
    try {
      const player = game.players.find(p => p.id === playerId);
      if (player) {
        player.connected = true;
        player.id = socket.id; // Update to new socket id
        socket.join('table');
        
        console.log(`Player ${player.name} reconnected`);
        broadcastGameState();
        
        callback && callback({ 
          ok: true, 
          player: {
            id: player.id,
            name: player.name,
            chips: player.chips,
            seat: player.seat
          }
        });
      } else {
        // Player not found, treat as new join
        const newPlayer = game.addPlayer(socket.id, name);
        socket.join('table');
        
        console.log(`New player ${newPlayer.name} joined (reconnect attempt)`);
        broadcastGameState();
        
        callback && callback({ 
          ok: true, 
          player: {
            id: newPlayer.id,
            name: newPlayer.name,
            chips: newPlayer.chips,
            seat: newPlayer.seat
          }
        });
      }
    } catch (error) {
      console.error('Error handling reconnection:', error);
      callback && callback({ ok: false, error: error.message });
    }
  };
}

function handleRemoveUnreadyPlayers(socket) {
  return ({ password }, callback) => {
    try {
      if (!password || password !== process.env.ADMIN_PASSWORD) {
        callback && callback({ ok: false, error: 'Unauthorized: Invalid admin password' });
        return;
      }
      game.removeUnreadyPlayers();
      broadcastGameState();
      callback && callback({ ok: true });
    } catch (error) {
      console.error('Error removing unready players:', error);
      callback && callback({ ok: false, error: error.message });
    }
  };
}

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);

  socket.on('join', handleJoin(socket));
  socket.on('start_hand', handleStartHand(socket));
  socket.on('action', handleAction(socket));
  socket.on('get_state', handleGetState(socket));
  socket.on('get_actions', handleGetActions(socket));
  socket.on('reset_game', handleResetGame(socket));
  socket.on('disconnect', handleDisconnect(socket));
  socket.on('reconnect', handleReconnect(socket));
  socket.on('remove_unready_players', handleRemoveUnreadyPlayers(socket));

  // Send initial state to newly connected socket
  socket.emit('room_state', game.getPublicState());
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  const url = `http://${localIp}:${PORT}`;

  console.log(`Poker server running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: ${url}`);

  // Show QR code in terminal
  showQRCode(url);

  console.log(`Game started with blinds: ${game.smallBlind}/${game.bigBlind}`);
});