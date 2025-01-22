const path = require('path');
const express = require('express');
const fs = require('fs');
const Pusher = require('pusher');

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Pusher Configuration
const pusher = new Pusher({
    appId: "1929540",
    key: "bf39691ddf040ec7cad2",
    secret: "99fd1be0107b33d8f484",
    cluster: "us3",
    useTLS: true,
});

// Watch for `out.glb` Changes
fs.watch(path.join(__dirname, 'out.glb'), (eventType) => {
    if (eventType === 'change') {
        console.log('out.glb updated');
        pusher.trigger('cad-channel', 'model-updated', {
            message: 'out.glb has been updated.',
        });
    }
});

// Serve Static Files (Frontend & out.glb)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/out.glb', (req, res) => {
    const filePath = path.join(__dirname, 'out.glb');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Model not found');
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
