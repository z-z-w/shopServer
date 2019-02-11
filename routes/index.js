var express = require('express');
var router = express.Router();
var User = require('../models/users')
var Good = require('../models/goods')

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
        successRes.data = {username: user.username}
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
              if (succ) {
                  req.cookies.set('shop_user',JSON.stringify({
                    _id: succ._id,
                    username: succ.username
                  }));
                  successRes.data = {username: succ.username}
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
                successRes.data = {username: user.username}
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

module.exports = router;
