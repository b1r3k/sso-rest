angular.module('sso-rest', []);

angular.module('sso-rest').
    controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.appMsg = '';
        $scope.user = '';
        $scope.password = '';
        $scope.token = '';

        $scope.login = function () {
            var payload = {
                user: $scope.user,
                password: $scope.password
            };

            $http.post('/sso', payload).
                success(function (data) {
                    $scope.token = data;
                    $scope.appMsg = 'logged in';
                }).
                error(function (data) {
                    $scope.token = data;
                    $scope.appMsg = 'fail :(';
                });
        };

        $scope.ping = function () {
            $http.get('/ping', {params: {user: $scope.user, password: $scope.password}}).
                success(function (data, status) {
                    $scope.appMsg = 'status:' + status + ' data: ' + data;
                }).
                error(function (data, status) {
                    $scope.appMsg = 'status:' + status + ' data: ' + data;
                });
        };

        $scope.pong = function () {
            $http.get('/pong', {params: {token: $scope.token}}).
                success(function (data, status) {
                    $scope.appMsg = 'status:' + status + ' data: ' + data;
                }).
                error(function (data, status) {
                    $scope.appMsg = 'status:' + status + ' data: ' + data;
                });
        };
    }]);