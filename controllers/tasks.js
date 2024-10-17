const Task = require('../models/Task');
const User = require('../models/User');

// add task to user and avoid duplicate entries
const addTaskToUser = async (userId, taskId) => {
    const user = await User.findById(userId);
    if (user && !user.tasks.includes(taskId)) {
        user.tasks.push(taskId);
        await user.save();
    }
};

// remove task from user's tasks array
const removeTaskFromUser = async (userId, taskId) => {
    const user = await User.findById(userId);
    if (user && user.tasks.includes(taskId)) {
        user.tasks = user.tasks.filter(task => task.toString() !== taskId.toString());
        await user.save();
    }
};



// Get all the task a user have access
exports.getAllTasks = async (req, res) => {
    try {
        const userId = req.user._id
        const tasks = await Task.find({ assignees: userId });
        return res.status(200).json({
            success: true,
            tasks,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
        });
    }
};

// get task details
exports.getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate('assignees');
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        return res.status(200).json({
            success: true,
            task,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve task",
        });
    }
};


// Create Task
exports.createTask = async (req, res) => {
    try {
        const { title, priority, checkLists, assigneesEmails } = req.body;
        const currentUserId = req.user._id;

        const task = new Task({
            title,
            priority,
            checkLists,
            assignees: [currentUserId],
        });

        if (assigneesEmails && assigneesEmails.length > 0) {
            const assignees = await User.find({ email: { $in: assigneesEmails } });
            task.assignees = [...new Set([...task.assignees, ...assignees.map(user => user._id)])];
        }

        await task.save();

        // Add task to users' tasks array
        task.assignees.forEach(async userId => await addTaskToUser(userId, task._id));

        return res.status(201).json({
            success: true,
            task,
            message: "Task created successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Task creation failed",
        });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, priority, checkLists, assigneesEmails } = req.body;
        const currentUserId = req.user._id;

        const task = await Task.findById(id).populate('assignees');
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const originalAssignees = task.assignees.map(assignee => assignee._id.toString());

        task.title = title || task.title;
        task.priority = priority || task.priority;
        task.checkLists = checkLists || task.checkLists;

        let updatedAssignees = [currentUserId];
        if (assigneesEmails && assigneesEmails.length > 0) {
            const newAssignees = await User.find({ email: { $in: assigneesEmails } });
            updatedAssignees = [...new Set([...updatedAssignees, ...newAssignees.map(user => user._id)])];
        }

        task.assignees = updatedAssignees;

        await task.save();

        // Add task to new assignees and remove from previous assignees if needed
        updatedAssignees.forEach(async userId => await addTaskToUser(userId, task._id));
        const removedAssignees = originalAssignees.filter(id => !updatedAssignees.includes(id));
        removedAssignees.forEach(async userId => await removeTaskFromUser(userId, task._id));

        return res.status(200).json({
            success: true,
            task,
            message: "Task updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Task update failed",
        });
    }
};


// Delete Task
exports.destroyTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task.assignees.forEach(async userId => await removeTaskFromUser(userId, task._id));

        await task.remove();

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Task deletion failed",
        });
    }
};

