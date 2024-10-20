const User = require('../models/User');
const Task = require('../models/Task');

exports.addPeople = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { email } = req.body;

        const newUser = await User.findOne({ email:email });
        console.log(newUser);
        if (!newUser) {
            return res.status(404).json({
                success: false,
                message: 'User to add not found'
            });
        }

        const tasks = await Task.find({ author: currentUserId });
        if (!tasks || tasks.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No tasks to grant access to'
            });
        }

        for (let task of tasks) {
            if (!task.haveAccess.includes(newUser._id)) {
                task.haveAccess.push(newUser._id);
                await task.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: `Access granted to ${newUser.email} for all tasks`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error granting task access'
        });
    }
};



exports.getAllUsers = async (req, res)=>{
    try{
        const users = await User.find({});
        res.status(200).json({
            success:true,
            message:'Users data fetched successfully',
            users
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Something went wrong',
        })
    }
}