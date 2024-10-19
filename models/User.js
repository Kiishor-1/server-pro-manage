const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Task = require('./Task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Task",
        }
    ]
})

userSchema.post("findOneAndDelete", async (user) => {
    if (user.tasks.length) {
        await Task.deleteMany({ _id: { $in: user.tasks } });
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User;