const Task = require('../models/Task');

module.exports.isAuthor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user || !user._id) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: User not authenticated',
            });
        }
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
            });
        }

        const isAuthor = task.author.toString() === user._id.toString();
        const isAssignee = task.assignee && task.assignee.toString() === user._id.toString();
        const hasAccess = task.haveAccess.includes(user._id);

        if (!isAuthor && !isAssignee && !hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized: You do not have access to this task',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Something went wrong',
        });
    }
};
