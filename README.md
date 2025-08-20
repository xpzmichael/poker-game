# Poker Game

A multiplayer poker game that allows players to join and play together over the same WiFi network. Supports cross-device play (e.g., phones, tablets, computers) without any additional setup beyond a single server device.

## Features
- Real-time multiplayer poker gameplay.
- Cross-platform compatibility: Any device with a web browser can join.
- Easy joining via URL or QR code scan.
- Simple server setup using Node.js.

## Requirements
- One device to act as the server (must have Node.js installed).
- All players must be connected to the same WiFi network.
- Web browser on client devices (no additional apps required).

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd poker-game
   ```
2. Install dependencies:
   - For the server: 
     ```
     cd server
     npm install
     ```
   - For the client (if building frontend):
     ```
     cd client
     npm install
     ```

3. Configure the server:
   - Create a `.env` file in the `server` folder with the following content:
     ```
     PORT=3000
     ADMIN_PASSWORD=admin_password
     ```
   - Replace `admin_password` with a secure password if needed.

## Usage
### Starting the Server
1. Navigate to the server directory:
   ```
   cd server
   ```
2. Run the server:
   ```
   node server.js
   ```
3. The terminal will display:
   ```
   Poker server running at:
      Local:   http://localhost:3000
      Network: http://<network-ip>:3000
   ```
   A QR code will also appear for easy scanning.

### Joining the Game
- On client devices, open a web browser.
- Enter the Network URL (e.g., `http://<network-ip>:3000`) or scan the QR code displayed on the server terminal.
- Players can now join and start playing poker together.

Note: Ensure all devices are on the same WiFi network for connectivity.

## Development
### Building the Frontend
To build or modify the client-side code:
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Run the build command:
   ```
   npm run build
   ```
This will generate the production-ready frontend files.

### Additional Notes
- The server handles game logic and real-time communication.
- Remember to add a `.env` in the server folder to include port and admin password like this
```
PORT=3000
ADMIN_PASSWORD=admin_password
```

### &nbsp;&nbsp;Enjoy Playing!
