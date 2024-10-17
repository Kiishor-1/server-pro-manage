const Task = require('../models/Task');

exports.getAllTasks = async (req, res) => {
    res.send('get all tasks handler');
}

exports.createTask = async (req, res) => {
    res.send('create task handler');
}

exports.getTask = async (req, res) => {
    const { id } = req.params;
    res.send('get task handler');
}

exports.updateTask = async (req, res) => {
    const {id} = req.params;
    res.send('update task handler');
}

exports.destroyTask = async (req, res) => {
    const {id} = req.params;
    res.send('delete task handler');
}