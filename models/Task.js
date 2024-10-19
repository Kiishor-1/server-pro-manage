const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
        enum: ['HIGH-PRIORITY', 'MODERATE-PRIORITY', 'LOW-PRIORITY'],
    },
    category:{
        type:String,
        required:true,
        enum:['Backlog','ToDo','InProgress','Done'],
        default:'ToDo',
    },
    checkLists: [
        {
            type: String,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    assignees: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    ]
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;