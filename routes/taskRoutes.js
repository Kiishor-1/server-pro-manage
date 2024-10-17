const express = require('express');
const { getAllTasks, createTask, getTask, updateTask, destroyTask } = require('../controllers/tasks');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAuthor } = require('../middlewares/isAuthor');
const router = express.Router();


router.route('/')
    .get(authMiddleware, getAllTasks)
    .post(authMiddleware, createTask);

router.route('/:id')
    .get(authMiddleware, getTask)
    .put(authMiddleware, isAuthor, updateTask)
    .delete(authMiddleware, isAuthor, destroyTask);

module.exports = router;