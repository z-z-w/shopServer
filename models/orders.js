const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    "orderNo": String,
    "payment": Number,
    "createTime": String,
    "orderItemVoList": [
        {
            "orderNo": String,
            "productId": Number,
            "productName": String,
            "productImage": String,
            "currentUnitPrice": Number,
            "quantity": Number,
            "totalPrice": Number,
            "createTime": String
        }
    ],
    "receiverName": String,
    "address": String
});

module.exports = mongoose.model('Order', OrderSchema);