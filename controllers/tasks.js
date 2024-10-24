const Task = require('../models/Task');
const User = require('../models/User');
const moment = require('moment');

exports.getAllTasks = async (req, res) => {
    try {

        console.log('received request')

        const userId = req.user._id;
        const { filter } = req.query;

        console.log('req.query', filter)

        let dateFilter = {};

        if (filter === 'today') {
            const today = moment().startOf('day');
            const tomorrow = moment(today).endOf('day');
            dateFilter.dueDate = { $gte: today.toDate(), $lte: tomorrow.toDate() };
        } else if (filter === 'week') {
            const startOfWeek = moment().startOf('week');
            const endOfWeek = moment().endOf('week');
            dateFilter.dueDate = { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() };
        } else if (filter === 'month') {
            const startOfMonth = moment().startOf('month');
            const endOfMonth = moment().endOf('month');
            dateFilter.dueDate = { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() };
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

        console.log('id', id)
        const userId = req.user._id;

        const task = await Task.findById(id).populate({
            path: 'assignee',
            select: '-password'
        });

        console.log(task)

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
            newTask.dueDate = date;
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
    console.log('object')
    try {
        const { id } = req.params;
        console.log("id", id)
        const { title, priority, checkLists, date, assignee } = req.body;
        console.log('reqbody', req.body)

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        console.log('2')
        task.title = title;
        task.priority = priority;
        task.checkLists = checkLists;
        task.dueDate = date;
        console.log('2.1')
        if (assignee) {
            const newAssignee = await User.findOne({ email: assignee });
            if (!newAssignee) {
                return res.status(404).json({
                    success: false,
                    error: 'Assignee not found'
                });
            }
            console.log('3')

            if (task.assignee) {
                const previousAssignee = await User.findById(task.assignee);
                previousAssignee.tasks.pull(task._id);
                await previousAssignee.save();
            }
            task.assignee = newAssignee._id;
        }
        await task.save();
        console.log('4')
        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
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
        console.log('check')
        const author = await User.findById(task.author);
        author.tasks.pull(task._id);
        console.log('check')
        await author.save();
        console.log('check')
        // await task.remove();
        await Task.findByIdAndDelete(id);

        console.log('check')
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

    console.log("check0")

    const allowedCategories = ['Backlog', 'ToDo', 'InProgress', 'Done'];

    try {
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category'
            });
        }
        console.log("check1")
        const task = await Task.findById(id);
        if (!task) {
            console.log('error itthe3')
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        console.log("check2")
        task.category = category;
        await task.save();
        console.log("check3")
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
    console.log('received');
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