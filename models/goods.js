const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    "id": Number,
    "categoryId": Number,
    "parentCategoryId": Number,
    "name": String,
    "desc": String,
    "imageHost": String,
    "mainImage": String,
    "imgList": Array,
    "salePrice": Number,
    "imgDetailList": Array,
    "price": Number,
    "stock": Number,
    "status": Number,
    "createTime": String,
    "updateTime": String
});

module.exports = mongoose.model('Goods', productSchema);