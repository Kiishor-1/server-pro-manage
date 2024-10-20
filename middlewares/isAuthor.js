const Task = require('../models/Task');

module.exports.isAuthor = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('id',id)
        const user = req.user;

        if (!user || !user._id) {
            console.log('error itthe')
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated',
            });
        }
        const task = await Task.findById(id);

        if (!task) {
            console.log('error itthe')
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const isAuthor = task.author.toString() === user._id.toString();
        const isAssignee = task.assignee && task.assignee.toString() === user._id.toString();
        const hasAccess = task.haveAccess.includes(user._id);

        if (!isAuthor && !isAssignee && !hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You do not have access to this task',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
};
