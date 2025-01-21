const path = require('path');
const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Move up one directory to serve files from root
app.use(express.static(path.join(__dirname, '..'))); 
app.use(express.json());

app.use('/manifold_lib', express.static(path.join(__dirname, '..', 'manifold_lib')));
app.use('/parts', express.static(path.join(__dirname, '..', 'parts')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Add specific route for GLB file
app.get('/out.glb', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'out.glb'));
});

app.post('/api/save', async (req, res) => {
    const code = req.body.code;
    try {
        // Instead of writing to filesystem, use memory or database
        // For now, we'll just return a mock success
        console.log('Received code:', code);
        
        // TODO: Implement proper model generation
        // For now just returning success
        res.json({ 
            success: true,
            message: 'Code received successfully'
        });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Server failed to process request'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
