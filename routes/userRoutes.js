const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addPeople, getAllUsers, updateUserData } = require('../controllers/user');

router.post('/add-people',authMiddleware, addPeople);
router.get('/', getAllUsers)
router.put('/update', authMiddleware, updateUserData)

module.exports = router;