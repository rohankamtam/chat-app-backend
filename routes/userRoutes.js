const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController.js');

const router = express.Router();

// When a POST request is made to '/register', call the registerUser controller
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;