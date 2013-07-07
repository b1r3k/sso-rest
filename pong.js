var http = require('http');

module.exports = {
    pong: function (req, res) {
        var token = req.query['token'] || req.body['token'];
        var options = { host: 'localhost', port: process.env.PORT || 3000, path: '/sso?token=' + token, method: 'GET', rejectUnauthorized: false };
        http.request(options)
            .on('response',function (value) {
                if (value.statusCode > 300) {
                    res.send(401, 'token expired');
                } else {
                    res.send(200, 'token still valid');
                }
            }).on('error',function (e) {
                console.log(e);
                res.send(500, 'something went wrong: ' + e);
            }).end();
    }
};
