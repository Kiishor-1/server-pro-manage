const express = require('express');
const { getAllTasks, createTask, getTask, updateTask, destroyTask } = require('../controllers/tasks');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAuthor } = require('../middlewares/isAuthor');
const router = express.Router();



router.get("/", authMiddleware, getAllTasks)
router.post("/create", authMiddleware, createTask);

router.get('/:id', authMiddleware, getTask);
router.put('/update/:id', authMiddleware, isAuthor, updateTask);
router.delete('/delete/:id', authMiddleware, isAuthor, destroyTask);

module.exports = router;