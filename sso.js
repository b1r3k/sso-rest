var crypto = require("crypto");

var cache = {};
var TEN_SECONDS = 10000;

module.exports = {
    authenticate: function (req, res) {
        var user = req.query['user'] || req.body['user'];
        var password = req.query['password'] || req.body['password'];
        var hasher = crypto.createHash('md5');
        hasher.update(user + password);
        var token = hasher.digest('base64');
        cache[token] = new Date;
        res.send(200, token);
    },

    validate: function (req, res) {
        var token = req.query['token'] || req.body['token'];
        if (!(token in cache)) {
            return res.send(401, 'User is not authorized');
        }

        var timestamp = cache[token];

        var timeElapsed = (new Date) - timestamp;
        if (timeElapsed > TEN_SECONDS) {
            return res.send(401, 'User is not authorized');
        }
        return res.send(204)
    }
};