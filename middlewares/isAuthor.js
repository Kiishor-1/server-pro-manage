const Task = require('../models/Task');

module.exports.isAuthor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req?.user;

        if (!user || !user._id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated',
            });
        }

        const task = await Task.findById(id).populate('assignees');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const isAssigned = task.assignees.some(
            (assignee) => assignee._id.toString() === user._id.toString()
        );

        if (!isAssigned) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You are not allowe to make changes',
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
};
