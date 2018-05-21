var CONFIG = require('config');

var http = require('http');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));

/*  Session  */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("saltysalt"));
app.use(session({
    secret: 'kiki0101',
    resave: true,
    saveUninitialized: true
}));


var RoomModel = require('./modules/room');
Room = new RoomModel();

/*  paths  */
app.use(express.static(__dirname + '/'));
app.use(express.static(path.join(__dirname, 'public')));

/*  use template engine  */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*  route setting  */
app.use('/login',  require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/room',   require('./routes/room'));
app.use('/',       require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var server = http.createServer(app);

var ws_server = require('./modules/ws_server')(server);


server.listen(CONFIG.port);