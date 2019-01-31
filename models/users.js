const mongoose = require('mongoose');
const UsersSchema = new mongoose.Schema({
    "id": Number,
    "username": String,
    "password": String,
    "email": String,
    "phone": String,
    "question": String,
    "answer": String,
    "role": Number,
    "createTime": String,
    "updateTime": String,
    "isAdmin": Boolean
});

module.exports = mongoose.model('User', UsersSchema);