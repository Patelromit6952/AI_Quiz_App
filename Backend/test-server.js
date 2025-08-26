const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Test route imports
const leaderboardRoutes = require('./routes/leaderboard');
const aiHintsRoutes = require('./routes/aiHints');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test routes
app.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// Mount the routes that were causing issues
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ai-hints', aiHintsRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('✅ Routes mounted successfully - no TypeError!');
    process.exit(0);
});
