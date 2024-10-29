const Task = require('../models/Task');
const User = require('../models/User');
const moment = require('moment');
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('../utils/dateUtils');

exports.getAllTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const { filter } = req.query;

        console.log('Filter applied:', filter);

        let dateFilter = {};

        if (filter === 'today') {
            dateFilter.dueDate = { $gte: startOfDay(), $lte: endOfDay() };
        } else if (filter === 'week') {
            dateFilter.dueDate = { $gte: startOfWeek(), $lte: endOfWeek() };
        } else if (filter === 'month') {
            dateFilter.dueDate = { $gte: startOfMonth(), $lte: endOfMonth() };
        }
        const tasks = await Task.find({
            $or: [
                { author: userId },
                { assignee: userId },
                { haveAccess: userId }
            ],
            ...dateFilter
        }).populate({
            path: 'assignee',
            select: '-password'
        });

        return res.status(200).json({
            success: true,
            tasks
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve tasks'
        });
    }
};


exports.getTaskDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // const userId = req.user._id;

        const task = await Task.findById(id).populate({
            path: 'assignee',
            select: '-password'
        });

        // const task = await Task.findOne({
        //     _id: id,
        //     $or: [
        //         { author: userId },
        //         { assignee: userId },
        //         { haveAccess: userId }
        //     ]
        // });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found or access denied'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task fetched successfully',
            task
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: 'Error retrieving task detail'
        });
    }
};


exports.createTask = async (req, res) => {
    try {
        const { title, priority, checkLists, date, assignee: assigneeEmail } = req.body;
        const authorId = req.user._id;

        const newTask = new Task({
            title,
            priority,
            checkLists,
            createdAt: new Date(),
            author: authorId
        });


        if (date) {
            newTask.dueDate = startOfDay(new Date(date))
        }

        if (assigneeEmail) {
            const assignee = await User.findOne({ email: assigneeEmail });
            if (!assignee) {
                return res.status(404).json({
                    success: false,
                    error: 'Assignee not found'
                });
            }

            newTask.assignee = assignee._id;
        }

        await newTask.save();

        const currentUser = await User.findById(authorId);
        currentUser.tasks.push(newTask._id);
        await currentUser.save();

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task: newTask
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: 'Error creating task'
        });
    }
};


exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, priority, checkLists, date, assignee } = req.body;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        task.title = title;
        task.priority = priority;
        task.checkLists = checkLists;
        if (date) {
            task.dueDate = startOfDay(new Date(date))
        }
        if (assignee) {
            const newAssignee = await User.findOne({ email: assignee });
            if (!newAssignee) {
                return res.status(404).json({
                    success: false,
                    error: 'Assignee not found'
                });
            }

            if (task.assignee) {
                const previousAssignee = await User.findById(task.assignee);
                previousAssignee.tasks.pull(task._id);
                await previousAssignee.save();
            }
            task.assignee = newAssignee._id;
        }
        await task.save();
        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: 'Error updating task'
        });
    }
};


exports.destroyTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        const author = await User.findById(task.author);
        author.tasks.pull(task._id);
        await author.save();
        await Task.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error deleting task'
        });
    }
};


exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { category } = req.body;


    const allowedCategories = ['Backlog', 'ToDo', 'InProgress', 'Done'];

    try {
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category'
            });
        }
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        task.category = category;
        await task.save();
        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            task
        });

    } catch (error) {
        console.error(error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Invalid task ID' });
        }
        return res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
    }
}

exports.analytics = async (req, res) => {
    const currentUserId = req.user._id;
    if (!currentUserId) {
        return res.status(403).json({
            success: false,
            error: 'Unauthorized'
        });
    }

    try {
        const analytics = {};

        analytics.backlogTasks = await Task.countDocuments({
            category: 'Backlog',
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        analytics.toDoTasks = await Task.countDocuments({
            category: 'ToDo',
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        analytics.inProgressTasks = await Task.countDocuments({
            category: 'InProgress',
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        analytics.completedTasks = await Task.countDocuments({
            category: 'Done',
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        analytics.lowPriorityTasks = await Task.countDocuments({
            priority: 'LOW-PRIORITY',
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        analytics.moderatePriorityTasks = await Task.countDocuments({
            priority: 'MODERATE-PRIORITY',
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        analytics.highPriorityTasks = await Task.countDocuments({
            priority: 'HIGH-PRIORITY',
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        analytics.dueDateTasks = await Task.countDocuments({
            dueDate: { $exists: true },
            $or: [
                { author: currentUserId },
                { assignee: currentUserId },
                { haveAccess: currentUserId }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Tasks analysis done',
            analytics
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task analytics'
        });
    }
}