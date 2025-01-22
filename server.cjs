const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const glbFilePath = path.join(__dirname, 'out.glb');

// Watch the GLB file for changes and notify connected clients
fs.watch(glbFilePath, (eventType) => {
    if (eventType === 'change') {
        console.log('out.glb has been updated.');
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('update');
            }
        });
    }
});


app.get('/dingcad.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'dingcad.png'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/out.glb', (req, res) => {
    const filePath = path.join(__dirname, 'out.glb');
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'model/gltf-binary');
        res.sendFile(filePath);
    } else {
        res.status(404).send('Model not found');
    }
});

fetch('https://41c5-65-128-108-231.ngrok-free.app/out.glb')
    .then((res) => res.blob())
    .then((blob) => {
        console.log('Fetched blob:', blob);
    })
    .catch((err) => console.error('Error fetching blob:', err));


wss.on('connection', function connection(ws) {
    console.log('A new client connected.');
    ws.send('Welcome New Client!');

    // Send a message when the model updates
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
