app.controller("RegisterController", function ($scope, UserService, $location, $timeout) {
    $scope.formModel = {};

    $scope.register = function (valid) { 
        $scope.errorMessage = false;
        if (valid) {
            UserService.postRegister($scope.formModel).then(function (res) {
                if (res.data.success) {
                    $scope.successMessage = res.data.message;
                    $timeout(function () {
                        $location.path('/dashboard');
                    }, 2000);
                    console.log("Request (OK-reg) to server: ", res.data.message);
                } else {
                    $scope.errorMessage = res.data.message;
                    $location.path('/register');
                    console.log("Request (ERROR-reg) to server: ", res.data.message);
                }
            });
        } else {
           $scope.errorMessage = "Please ensure the form is filled properly!";
        }
        UserService.downloadUsers().then(function (res, err) {
            if (res) {
                $scope.allUsers = res.data;
                // console.log("get dataaa from REGISTER", res.data);
            } else {
                $scope.errorMessage = err.data;
            }
        });

    };
});
