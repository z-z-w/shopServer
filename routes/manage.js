var express = require('express');
var router = express.Router();
var multer = require('multer')
var fs = require('fs')
var User = require('../models/users')
var Category = require('../models/categorys')
var Good = require('../models/goods')

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

//添加品类
router.post('/category/add_category', function(req, res, next) {
    let parentId = req.body.parentId
    let name = req.body.name
    let id = 1
    Category.find().sort({id: -1}).limit(1).then(c => {
        if (c) {
            id = c[0].id + 1
        }
        new Category({
            id,
            parentId,
            name,
            createTime: +new Date(),
            status: true
        }).save().then(c => {
            if (c) {
                successRes.data = c
                res.json(successRes)
            } else {
                errRes.msg = '添加失败'
                res.json(errRes)
            }
        })
    })
})

//修改品类名称
router.post('/category/set_category_name', function(req, res, next) {
    let _id = req.body._id
    let name = req.body.name
    Category.updateOne({
        _id
    },{
        name
    }).then(msg => {
        if(msg.ok) {
            successRes.data = {}
            res.json(successRes)
        } else {
            errRes.msg = "更新品类名字失败"
            res.json(errRes)
        }
    })
})

//上传图片
router.post('/product/upload_img', upload.single('file'), function(req, res, next) {
    var file = req.file
    successRes.data = {
        uri: file.filename,
        url: 'http://localhost:3000/images/' + file.filename
    }
    // 接收文件成功后返回数据给前端
    res.json(successRes);
})

//删除图片
router.post('/product/delete_img', function(req, res, next) {
    var filename = req.body.uri
    fs.unlinkSync('../shop-server/public/images/' + filename);
    successRes.data = {}
    res.json(successRes)
})

//新增或更新产品
router.post('/product/save', function(req, res, next) {
    if(req.body._id) {
        Good.updateOne({
            _id: req.body._id
        }, {...req.body}).then(product => {
            successRes.data = product
            res.json(successRes)
        })
    } else {
        new Good({
            ...req.body
        }).save().then((good) => {
            successRes.data = good
            res.json(successRes)
        })
    }
})

//产品列表
router.post('/product/list', function(req, res, next) {
    let pageNum = req.body.pageNum
    let pageSize = req.body.pageSize || 10
    Good.countDocuments().then(count => {
        let pages = Math.ceil(count / pageSize)
        let skip = (pageNum - 1) * pageSize

        Good.find().limit(pageSize).skip(skip).sort({_id: -1}).then(goods => {
            successRes.data = {
                list: goods,
                pages,
                total: count
            }
            res.json(successRes)
        })
    })
})

//产品详情
router.post('/product/detail', function(req, res, next) {
    let _id = req.body._id
    Good.findOne({
        _id
    }).then(good => {
        successRes.data = good
        res.json(successRes)
    })
})

//产品上下架
router.post('/product/set_sale_status', function(req, res, next) {
    let _id = req.body._id
    let status = req.body.status
    Good.updateOne({
        _id
    },{
        status
    }).then(good => {
        if(good.ok) {
            successRes.data = {}
            res.json(successRes)
        } else {
            errRes.msg = "更新商品销售状态失败"
            res.json(errRes)
        }
    })
})

//搜索产品
router.post('/product/search', function(req, res, next) {
    let q = req.body.q
    let pageSize = req.body.pageSize || 10
    let pageNum = req.body.pageNum
    let skip = (pageNum - 1) * pageSize
    Good.find({
        name: new RegExp(q + '.*', 'i')
    }).count().then(count => {
        if (count) {
            Good.find({
                name: new RegExp(q + '.*', 'i')
            }).skip(skip).limit(pageSize).sort({_id: -1}).then(goods => {
                successRes.data = {
                    total: count,
                    isSearching: true, //用于前端表示正在搜索
                    lists: goods,
                    pageNum
                }
                res.json(successRes)
            })
        } else {
            errRes.msg = "无搜索结果"
            res.json(errRes)
        }
    })
})

module.exports = router;
