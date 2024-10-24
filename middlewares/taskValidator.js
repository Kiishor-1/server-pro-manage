const { taskSchema } = require('../schema');
const Task = require('../models/Task');

module.exports.taskValidator = async (req, res, next) => {
    try {
        const { error } = taskSchema.validate(req.body);
        if (error) {
            let errMsg = error.details.map((el) => el.message).join(",");
            console.log('error',error);
            console.log('error message',errMsg);
            return res.status(403).json({
                success: false,
                error: errMsg,
            })
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        })
    }
}