const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    "id": Number,
    "categoryId": Number,
    "parentCategoryId": Number,
    "name": String,
    "subtitle": String,
    "imageHost": String,
    "mainImage": String,
    "subImages": Array,
    "salePrice": Number,
    "detail": String,
    "price": Number,
    "stock": Number,
    "status": Number,
    "createTime": String,
    "updateTime": String
});

module.exports = mongoose.model('Goods', productSchema);