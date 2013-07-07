var http = require('http')
    , querystring = require('querystring')
    , crypto = require("crypto");
var tokenCache = {};

var hashUserAndPassword = function (req) {
    var user = req.query['user'] || req.body['user'];
    var password = req.query['password'] || req.body['password'];
    var hasher = crypto.createHash('sha1');
    hasher.update(user + password);
    return hasher.digest('base64');
};

var requestTokenFromSSO = function (req, res, userPassword) {
    var user = req.query['user'] || req.body['user'];
    var password = req.query['password'] || req.body['password'];
    var payload = querystring.stringify({user: user, password: password});
    var options = {
        host: 'localhost',
        port: process.env.PORT || 3000,
        path: '/sso',
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': payload.length
        }
    };
    var sso_request = http.request(options)
        .on('response',function (sso_response) {
            sso_response.on('data', function (data) {
                tokenCache[userPassword] = data.toString();
                res.send(200, 'we have a new token');
            });
        }).on('error', function (e) {
            console.log(e);
            res.send(500, 'something went wrong: ' + e);
        });
    sso_request.write(payload);
    sso_request.end();
};

var validateToken = function (req, res, userPassword) {
    var token = tokenCache[userPassword];
    var options = { host: 'localhost', port: process.env.PORT || 3000, path: '/sso?token=' + token, method: 'GET', rejectUnauthorized: false };
    http.request(options)
        .on('response',function (value) {
            if (value.statusCode > 300) {
                requestTokenFromSSO(req, res, userPassword);
            } else {
                res.send(200, 'using old token');
            }
        }).on('error',function (e) {
            console.log(e);
            res.send(500, 'something went wrong: ' + e);
        }).end();
};

module.exports = {
    ping: function (req, res) {
        var userPassword = hashUserAndPassword(req);
        if (userPassword in tokenCache) {
            validateToken(req, res, userPassword);
        } else {
            requestTokenFromSSO(req, res, userPassword);
        }
    }
};
