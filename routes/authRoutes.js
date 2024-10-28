const express = require('express');
const { register, login } = require('../controllers/auth');
const userValidator = require('../middlewares/userValidator');
const router = express.Router();

router.post('/register', userValidator, register);
router.post('/login', login);

module.exports = router;