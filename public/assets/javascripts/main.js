//MODULE
var app = angular.module("myApp", ["ngRoute", 'AngularPrint']);

//ROUTES
app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: "assets/views/home.htm",
            controller: "WelcomeController"
        })
        .when('/', {
            templateUrl: "assets/views/home.htm",
            controller: "WelcomeController"
        })
         .when('/howItWorks', {
            templateUrl: "assets/views/howItWorks.htm"
            // controller: "WelcomeController"
        })
        .when('/login', {
            templateUrl: "assets/views/login.htm",
            controller: "MainLoginController",
            authenticated: false
        })
        .when('/register', {
            templateUrl: "assets/views/register.htm",
            controller: "RegisterController",
            authenticated: false
        })
        .when('/dashboard', {
            templateUrl: "assets/views/dashboard.htm",
            controller: "DashboardController",
            authenticated: true
        })
        .when('/logout', {
            templateUrl: "assets/views/logout.htm",
            controller: "MainLoginController",
            authenticated: true
        })
        .when('/about', {
            templateUrl: "assets/views/about.htm"

        })
        .when('/license', {
            templateUrl: "assets/views/license.htm"
        })
        .when('/contactUs', {
            templateUrl: "assets/views/contact.htm",
            controller: "ContactControler"
            // authenticated: false
        })




        .otherwise({ redirectTo: "/" });
});


//ROUTING RESTRICTIONS
app.run(['$rootScope', 'UserService', '$location', function($rootScope, UserService, $location) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (next.$$route.authenticated === true) {
            if (!UserService.isLoggedIn()) {
                event.preventDefault();
                $location.path('/');
            }
        } else if (next.$$route.authenticated === false) {
            if (UserService.isLoggedIn()) {
                event.preventDefault();
                $location.path('/dashboard');
            }
        }
    })
}]);




