var express = require('express')
    , http = require('http')
    , path = require('path')
    , sso = require('./sso')
    , ping = require('./ping')
    , pong = require('./pong');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set("view options", {layout: false});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.all('/', function (req, res) {
    res.sendfile('/public/index.html');
});

app.post('/sso', sso.authenticate);
app.get('/sso', sso.validate);

app.get('/ping', ping.ping);
app.get('/pong', pong.pong);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
