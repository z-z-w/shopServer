var express = require('express');
var router = express.Router();
var User = require('../models/users')
var Category = require('../models/categorys')
var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, '../shop-server/public/images')  //这里是图片存储路劲
    },
    filename: function (req, file, cb){
        cb(null,  Date.now() + '-' + file.originalname)
    }
});
var upload = multer({
    storage: storage
});

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

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//用户登陆
router.post('/user/login', function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password
    User.findOne({
        username,
        password
    }).then(user => {
        if (!user) {
            errRes.msg = '用户不存在或密码错误'
            res.json(errRes)
        } else if(!user.isAdmin) {
            errRes.msg = '该用户没有权限'
            res.json(errRes)
        } else {
            successRes.data = {
                "id": user._id,
                "username": user.username,
                "email": user.email || null,
                "phone": user.phone || null,
                "role": user.role || 0,
                "createTime": user.createTime,
                "updateTime": user.updateTime || user.createTime
            }
            req.cookies.set('userInfo',JSON.stringify({
                _id: user._id,
                username: user.username
            }));
            res.json(successRes)
        }
    })
})

//判断是否登陆
router.get('/user/isAdmin',function (req, res, next) {
    if(!req.userInfo.isAdmin){
        //如果当前用户是非管理员
        errRes.msg = '未有权限'
        res.json(errRes)
    } else {
        successRes.data = {}
        res.json(successRes)
    }
});

//退出登陆
router.get('/user/logout', function (req, res, next) {
    req.cookies.set('userInfo', null);
    successRes.data = {}
    res.json(successRes);
})

//用户列表
router.post('/user/list', function(req, res, next) {
    let pageNum = req.body.pageNum
    let pageSize = req.body.pageSize || 10
    User.count().then(count => {
        let pages = Math.ceil(count / pageSize)
        let skip = (pageNum - 1) * pageSize

        User.find().limit(pageSize).skip(skip).then(users => {
            successRes.data = {
                list: users,
                pages,
                total: count
            }
            res.json(successRes)
        })
    })
})

//获取品类子节点
router.post('/category/get_category', function(req, res, next) {
    let categoryId = req.body.id || 0
    Category.find({
        parentId: categoryId
    }).then(categorys => {
        if(!categorys.length) {
            errRes.msg = "该品类下没商品"
            res.json(errRes)
        } else {
            successRes.data = categorys
            res.json(successRes)
        }
    })
})

//上传文件
router.post('/product/upload_img', upload.single('file'), function(req, res, next) {
    var file = req.file
    successRes.data = {
        uri: file.filename,
        url: 'http://localhost:3000/images/' + file.filename
    }
    // 接收文件成功后返回数据给前端
    res.json(successRes);
})

module.exports = router;