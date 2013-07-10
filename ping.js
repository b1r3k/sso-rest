var request = require('request')
    , url = require('url')
    , crypto = require('crypto');
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
    var payload = {user: user, password: password};
    var link_options = {
        protocol: 'http:',
        hostname: 'localhost',
        port: process.env.PORT || 3000,
        pathname: '/sso'
    };
    var link = url.format(link_options);
    var options = {
        url: link,
        method: 'POST',
        json: payload
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode < 300) {
            tokenCache[userPassword] = body;
            res.send(200, 'we have a new token');
        } else {
            console.log(error);
            res.send(response.statusCode, 'something went wrong: ' + error);
        }
    });
};

var validateToken = function (req, res, userPassword) {
    var token = tokenCache[userPassword];
    var link_options = {
        protocol: 'http:',
        hostname: 'localhost',
        port: process.env.PORT || 3000,
        pathname: '/sso',
        search: '?token=' + token
    };
    var link = url.format(link_options);
    var options = {
        url: link,
        method: 'GET'
    };
    request(options, function (error, response) {
        if (!error && response.statusCode < 300) {
            res.send(200, 'using old token');
        } else if (!error) {
            requestTokenFromSSO(req, res, userPassword);
        } else {
            console.log(error);
            res.send(500, 'something went wrong: ' + error);
        }
    });
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
