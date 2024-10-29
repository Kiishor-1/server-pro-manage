const express = require('express');
const { getAllTasks, createTask, updateTask, destroyTask, getTaskDetail ,updateCategory, analytics} = require('../controllers/tasks');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAuthor } = require('../middlewares/isAuthor');
const { taskValidator } = require('../middlewares/taskValidator');
const router = express.Router();

router.get("/", authMiddleware, getAllTasks)
router.post("/create", authMiddleware, taskValidator, createTask);
router.get('/analytics',authMiddleware, analytics);
router.get('/:id', getTaskDetail);
router.put('/update/:id', authMiddleware, isAuthor,taskValidator, updateTask);
router.patch('/update/:id/category',authMiddleware,isAuthor, updateCategory);
router.delete('/delete/:id', authMiddleware, isAuthor, destroyTask);

module.exports = router;