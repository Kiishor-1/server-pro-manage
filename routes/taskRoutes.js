const express = require('express');
const { getAllTasks, createTask, updateTask, destroyTask, getTaskDetail ,updateCategory} = require('../controllers/tasks');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAuthor } = require('../middlewares/isAuthor');
const router = express.Router();

router.get("/", authMiddleware, getAllTasks)
router.post("/create", authMiddleware, createTask);
router.get('/:id', authMiddleware, getTaskDetail);
router.put('/update/:id', authMiddleware, isAuthor, updateTask);
router.patch('/update/:id/category',authMiddleware,isAuthor, updateCategory);
router.delete('/delete/:id', authMiddleware, isAuthor, destroyTask);

module.exports = router;