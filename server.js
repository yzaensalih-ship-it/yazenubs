import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer();
const bare = createBareServer('/bare/');

// Serve your public folder (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the Ultraviolet proxy engine files
app.use('/uv/', express.static(uvPath));

// Route normal web requests through Bare server
server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

// Route WebSocket traffic (for games/discord)
server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`yazenugb server active on port ${PORT}`));