var request = require('request')
    , url = require('url');

module.exports = {
    pong: function (req, res) {
        var token = req.query['token'] || req.body['token'];
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
                res.send(200, 'token still valid');
            } else if (!error) {
                res.send(response.statusCode, 'token expired');
            } else {
                console.log(error);
                res.send(500, 'something went wrong: ' + error);
            }
        });
    }
};
