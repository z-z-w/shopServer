var express = require('express');
var router = express.Router();
var User = require('../models/users')
var Good = require('../models/goods')
var Order = require('../models/orders')

var errRes = {
    status: 1,
    data: null,
    msg: ''
}
var successRes = {
    status: 0,
    data: null,
    msg: ''
}

router.post('/user/login', function(req, res, next) {
    let username = req.body.username
    let password = req.body.password
    User.findOne({
        username,
        password
    }).then(user => {
      if (!user) {
          errRes.msg = "找不到该用户"
          res.json(errRes)
      } else {
        req.cookies.set('shop_user',JSON.stringify({
            _id: user._id,
            username: user.username
        }));
          successRes.data = {
              _id: user._id,
              username: user.username,
          }
        res.json(successRes)
      }
    })
});

router.get('/user/logout', function(req, res, next) {
    req.cookies.set('shop_user',null);
    successRes.data = {}
    res.json(successRes);
})

router.post('/user/sign_up', function(req, res, next) {
    let username = req.body.username
    let password = req.body.password
    User.findOne({
        username
    }).then(user => {
        if (!user) {
            new User({
                username,
                password,
                createTime: +new Date(),
                isAdmin: false
            }).save().then(succ => {
                console.log(succ);
                if (succ) {
                  req.cookies.set('shop_user',JSON.stringify({
                    _id: succ._id,
                    username: succ.username
                  }));
                  successRes.data = {
                      _id: succ._id,
                      username: succ.username,
                  }
                  res.json(successRes)
              } else {
                  errRes.msg = "注册失败"
                  res.json(errRes)
              }
            })
        } else {
            errRes.msg = "该用户名已存在"
            res.json(errRes)
        }
    })
});

//判断是否登陆
router.get('/user/isLogin',function (req, res, next) {
    if(req.cookies.get('shop_user')){
        let shopUser = JSON.parse(req.cookies.get('shop_user'));

        //获取当前登录用户的类型,是否是管理员
        User.findById(shopUser._id).then(function(user){
            if (user) {
                successRes.data = {
                    _id: user._id,
                    username: user.username,
                }
                res.json(successRes)
            } else {
                errRes.msg = '未登录'
                res.json(errRes)
            }
        });
    } else {
        errRes.msg = '未登录'
        res.json(errRes)
    }
});

router.post('/user/search', function(req, res, next) {
    let q = req.body.q
    Good.find({
      name: new RegExp(q + '.*', 'i')
    }).then(goods => {
      if(goods.length) {
        successRes.data = goods
        res.json(successRes)
      } else {
        errRes.msg = '无搜索结果，换个关键词试试吧~'
          res.json(errRes)
      }
    })
})

//保存地址
router.post('/user/save_address', function(req, res, next) {
    let _id = req.body._id
    let addressObj = req.body.addressObj
    let isOldAddress = false;
    User.findById({
        _id
    }).then(user => {
        user.addressList.forEach((item,index) => {
            if (item.id === addressObj.id) {
                isOldAddress = true
                user.addressList[index] = {...addressObj}
            } else if (addressObj.is_default) {
                user.addressList[index].is_default = false
            }
        })
        if (!isOldAddress) {
            if(user.addressList.length === 0){
                addressObj.is_default = true;
            }
            user.addressList.push(addressObj);
        }
        return user.save();
    }).then((user, err) => {
        if(err){
            errRes.msg = "保存地址失败"
            res.json(errRes)
        }else {
            successRes.data = user.addressList
            res.json(successRes)
        }
    })
})

//获取地址
router.post('/user/get_address', function(req, res, next) {
    let _id = req.body._id
    User.findById({
        _id
    }).then(user => {
        if(user) {
            successRes.data = user.addressList
            res.json(successRes)
        } else {
            errRes.msg = "查找失败"
            res.json(errRes)
        }
    })
})

//删除地址
router.post('/user/delete_address', function(req, res, next) {
    let _id = req.body._id
    let addressId = req.body.addressId
    User.findById({
        _id
    }).then(user => {
        if (user.addressList.length === 1) {
            user.addressList = []
        } else {
            user.addressList.forEach((item, index) => {
                if (item.id === addressId) {
                    if (item.is_default) {
                        index === 0
                            ? user.addressList[1].is_default = true
                            : user.addressList[0].is_default = true
                    }
                    user.addressList.splice(index, 1)
                }
            })
        }
        return user.save()
    }).then((user, err) => {
        if (!err) {
            successRes.data = user.addressList
            res.json(successRes)
        } else {
            errRes.msg = '删除地址失败'
            res.json(errRes)
        }
    })
})

//添加到购物车
router.post('/user/add_to_cart', function(req, res, next) {
    let _id = req.body._id
    let good = req.body.good
    let isOldGood = false
    User.findById({
        _id
    }).then(user => {
        user.cartList.forEach((item,index) => {
            if (item.id === good.id) {
                isOldGood = true
                item.count += good.count
            }
        })
        if (!isOldGood) {
            user.cartList.push(good)
        }
        return user.save()
    }).then((user,err) => {
        if (!err) {
            successRes.data = user.cartList
            res.json(successRes)
        } else {
            errRes.msg = "添加到购物车失败"
            res.json(errRes)
        }
    })
})

//获取购物车信息
router.post('/user/get_cart', function(req, res, next) {
    let _id = req.body._id
    User.findById({
        _id
    }).then(user => {
        if(user) {
            successRes.data = user.cartList
            res.json(successRes)
        } else {
            errRes.msg = "获取购物车信息失败"
            res.json(errRes)
        }
    })
})

//更新购物车信息
router.post('/user/update_cart', function (req, res, next) {
    let _id = req.body._id
    let cartList = req.body.cartList
    User.updateOne({
        _id
    }, {
        cartList
    }).then((user, err) => {
        if (!err) {
            successRes.data = cartList
            res.json(successRes)
        } else {
            errRes.msg = '编辑商品失败'
            res.json(errRes)
        }
    })
})

//添加订单
router.post('/user/add_order', function (req, res, next) {
    let _id = req.body._id
    let goods = req.body.goods
    let address = req.body.address
    let payStatus = req.body.payStatus
    let orderStatus = req.body.orderStatus
    let totalPrice = req.body.totalPrice
    let orderId = req.body.orderId
    new Order({
        goods,
        address,
        payStatus,
        orderStatus,
        totalPrice,
        orderId
    }).save();
    User.findById({
        _id
    }).then(user => {
        user.orderList.push({
            goods,
            address,
            payStatus,
            orderStatus,
            totalPrice,
            orderId
        })
        let i = goods.length
        while(i--) {
            let good = goods[i]
            let index = user.cartList.findIndex(item => {
                return item.id === good.id
            })
            user.cartList.splice(index, 1)
        }
        return user.save()
    }).then((user, err) => {
        if (err) {
            errRes.msg = "下单失败"
            res.json(errRes)
        } else {
            let promiseAll = goods.map(good => {
                return Good.updateOne({
                    _id: good.id
                }, {
                    $inc: {stock: -good.count}
                })
            })
            return Promise.all(promiseAll)
        }
    }).then((succ,err) => {
        if (err) {
            errRes.msg = "更新商品库存失败"
            res.json(errRes)
        } else {
            successRes.data = {}
            res.json(successRes)
        }
    })
})

//获取订单
router.post('/user/get_orderList', function(req, res, next) {
    let _id = req.body._id
    let orderStatus = req.body.orderStatus
    User.findById({
        _id
    }).then(user => {
        if(orderStatus) {
            let arr = user.orderList.filter(item => {
                return item.orderStatus === orderStatus
            })
            successRes.data = arr.reverse()
            res.json(successRes)
        } else {
            successRes.data = user.orderList.reverse()
            res.json(successRes)
        }
    }).catch(() => {
        errRes.msg = "获取订单失败"
        res.json(errRes)
    })
})

//订单确认送达
router.post('/user/get_orderConfirm', function(req, res, next) {
    let _id = req.body._id
    let orderId = req.body.orderId
    User.findById({
        _id
    }).then(user => {
        user.orderList.forEach(order => {
            if (order.orderId === orderId){
                order.orderStatus = 2
            }
        })
        return user.save()
    }).then((user,err) => {
        if(err) {
            errRes.msg = "确认送达失败"
            res.json(errRes)
        } else {
            successRes.data = {}
            res.json(successRes)
        }
    })
})

module.exports = router;
