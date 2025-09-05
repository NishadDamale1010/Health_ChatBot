const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // for frontend

// Routes
app.use('/chat', chatRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
