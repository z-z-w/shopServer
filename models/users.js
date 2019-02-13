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
    "isAdmin": Boolean,
    "addressList": [{
        "id": String,
        "name": String,
        "tel": String,
        "province": String,
        "city": String,
        "county": String,
        "address_detail": String,
        "area_code": String,
        "postal_code": String,
        "is_default": Boolean,
        "address": String,
        "desc": String
    }],
    "cartList": [
        {
            "id": String,
            "name": String,
            "price": Number,
            "desc": String,
            "smpic": String,
            "count": Number,
            "stock": Number
        }
    ],
    "orderList": [
        {
            "goods": Array,
            "address": Object,
            "payStatus": Array,
            "orderStatus": Number,
            "totalPrice": Number,
            "orderId": String
        }
    ],
});

module.exports = mongoose.model('User', UsersSchema);