const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Unified endpoint for single or multiple tokens
router.post('/send', notificationController.sendNotification);

module.exports = router;

