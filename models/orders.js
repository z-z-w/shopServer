const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    "goods": Array,
    "address": Object,
    "payStatus": Array,
    "orderStatus": Number,
    "totalPrice": Number,
    "orderId": String
});

module.exports = mongoose.model('Order', OrderSchema);