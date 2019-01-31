const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    "id": Number,
    "parentId": Number,
    "name": String,
    "status": Boolean,
    "sortOrder": Number,
    "createTime": String,
    "updateTime": String
});

module.exports = mongoose.model('Category', CategorySchema);