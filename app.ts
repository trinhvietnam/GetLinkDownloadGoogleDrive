var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var film = require('./routes/film');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/film', film);
// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: Function) => {
    var err: any = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

    app.use(function (err: any, req: Request, res: Response, next: Function) {
        if(err.message == 'validation error'){

            // ResponseHelper.json(req,res,err.errors,null);
            ResponseHelper.json(req,res,ErrorHelper.error(ErrorEC.FAIL_VALIDATION,err,req),null);
            return;
        }
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err: any, req: Request, res: Response, next: Function) {
    console.log('2222222222222222222222',req.__);
    if(err.message == 'validation error'){

        // ResponseHelper.json(req,res,err.errors,null);
        ResponseHelper.json(req,res,ErrorHelper.error(ErrorEC.FAIL_VALIDATION,err,req),null);
        return;
    }

    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
