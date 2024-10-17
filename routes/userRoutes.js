const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addPeople } = require('../controllers/user');

router.post('/add-people',authMiddleware, addPeople);

module.exports = router;