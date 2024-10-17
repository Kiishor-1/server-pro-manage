const express = require('express');
const { getAllTasks, createTask, getTask, updateTask, destroyTask } = require('../controllers/tasks');
const router = express.Router();


router.route('/')
    .get(getAllTasks)
    .post(createTask);

router.route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(destroyTask);

module.exports = router;