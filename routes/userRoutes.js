const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addPeople, getAllUsers } = require('../controllers/user');

router.post('/add-people',authMiddleware, addPeople);
router.get('/', getAllUsers)

module.exports = router;