var serverTree = undefined;

app.controller("MainLoginController", function($scope, UserService, AuthFactoryToken, $location, $timeout, $rootScope, $anchorScroll) {
    $scope.formsModel = {};
    $scope.loadMe = false; // to hide HTML until loadMe becomes TRUE

    $rootScope.$on('$routeChangeStart', function() { // when ng-view is changint: to delete username(email) when logout...
        if (UserService.isLoggedIn()) {
            // $scope.emaiL = UsersFactoryService.getEmail(); 
            console.log("Success: User is logged in!");
            $scope.isLoggedIn = true; // to show menus
            UserService.getUser().then(function(data, err) {
                console.log("return data decoded ", data); // gets back an object with data 'No token provided!'; status code; status text
                $scope.email = data.data.email;
                $scope.loadMe = true; // to show when data is reseived and after that to show HTML
            })
        } else {
            console.log("Failure: User is not logged in!");
            $scope.isLoggedIn = false;
            $scope.email = "";
            $scope.loadMe = true;
            familyArray = [];
        };
    })


    // LOGIN FUNCTION
    $scope.loginFunc = function() {
        $scope.errorMessage = false;

        UserService.postLogin($scope.formsModel).then(function(res) {
            // console.log("dataaaaaa from login btn", res.data.email);
            if (res.data.success) {
                $scope.successMessage = res.data.message;
                $scope.theTree = res.data.tree;
                serverTree = res.data.tree;
                $timeout(function() {
                    $location.path('/dashboard');
                }, 2000);
            } else {
                $scope.errorMessage = res.data.message;
                $location.path('/login');
            }
        });
    };

    //LOGOUT FUNCTION
    $scope.logOut = function() {
        UserService.logOut();
        $location.path('/logout');
        $location.path('/');
    }

    //SCROLLING
    $scope.gotoTop = function() {
        $location.hash('top');
        $anchorScroll();
    };
});