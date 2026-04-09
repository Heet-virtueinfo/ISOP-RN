const express = require('express');
const cors = require('cors');
require('dotenv').config();
const notificationRoutes = require('./routes/notificationRoutes');
const { getWelcomeTemplate } = require('./utils/welcomeTemplate');

const app = express();
const port = process.env.PORT || 2000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(getWelcomeTemplate());
});

app.use('/api/notifications', notificationRoutes);

app.listen(port, () => {
  console.log(`ISoP Backend Server is running on http://localhost:${port}`);
});
