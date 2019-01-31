var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swig = require('swig')
var mongoose = require('mongoose');
var User = require('./models/users')

var app = express();

var indexRouter = require('./routes/index');
var manageRouter = require('./routes/manage');

var cookies = require('cookies')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置cookie
app.use(function(req, res, next){
    req.cookies = new cookies(req, res);

    req.userInfo = {};

    if(req.cookies.get('userInfo')){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前登录用户的类型,是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = userInfo.isAdmin;
                next();
            });
        }catch(e){
            next();
        }
    }else{
        next();
    }

});

app.use('/', indexRouter);
app.use('/manage', manageRouter);

mongoose.connect('mongodb://localhost:27017/shop', function(err) {
    if(err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(8081);
    }
});

//在开发过程中，需要取消模板缓存
swig.setDefaults({cache: false});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
