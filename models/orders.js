const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    "orderNo": String,
    "payment": Number,
    "paymentType": Number,
    "paymentTypeDesc": String,
    "postage": Number,
    "status": Number,
    "statusDesc": String,
    "paymentTime": String,
    "sendTime": String,
    "endTime": String,
    "closeTime": String,
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
    "imageHost": String,
    "shippingId": Number,
    "shippingVo": String
});

module.exports = mongoose.model('Order', OrderSchema);