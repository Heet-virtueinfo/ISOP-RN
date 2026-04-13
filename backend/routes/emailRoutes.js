const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/enrollment', emailController.sendEnrollmentEmail);

module.exports = router;
