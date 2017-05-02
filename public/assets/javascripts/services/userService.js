//FACTORY
app.factory("UserService", function($http, AuthFactoryToken, $q) {
    return {
        //DOWNLOAD ALL USERS
        downloadUsers: function() {

            return $http.get("users");
        },
        //POST DATA FROM REGISTRATION
        postRegister: function(person) {
            return $http.post("users/register", person).then(function(data) { // we have to write the promise, because we need to get the token first
                // console.log("TOKEN from the server (register): ", data.data.token);
                AuthFactoryToken.setToken(data.data.token);
                return data;
            });
        },
        //POST DATA FROM LOGIN
        postLogin: function(person) {
            return $http.post("users/login", person).then(function(data) { // we have to write the promise, because we need to get the token first
                // console.log("data front ", data.data);
                // console.log("DATA from the server (login) IDDDDD:  ", data); 
                AuthFactoryToken.setToken(data.data.token);
                return data;
            });
        },
        //CHECKS IF THE USER IS LOGDED IN - IF THERE IS A TOKEN
        isLoggedIn: function() {
            if (AuthFactoryToken.getToken()) { // it says: IF THE USER IS LOGGED IN.............
                return true;
            } else {
                return false;
            }
        },
        //GET TOKEN
        getUser: function() {
            if (AuthFactoryToken.getToken()) {
                return $http.post('users/me');
            } else {
                $q.reject({ message: "User has no token!" });
            }
        },
        //LOGOUT THE USER
        logOut: function() {
            AuthFactoryToken.setToken(); // written in this way (without parameters) means that is false----------------------------------------and will removeToken
            var emptyArray = [];
            window.localStorage.setItem('familyArray', JSON.stringify(emptyArray));
        },
        saveTree: function(tree) {
            return $http.post('theTree/dashboard', tree).then(function(data) {
                // console.log("tree from mongo ", data.data);
                return data.data;
            })
        },
        getAllTreesNames: function() {
            return $http.get('theTree/dashboard').then(function(data) {
                // console.log("all trees from mongo ", data.data);
                return data.data;
            })
        }
        // getAllTrees: function() {
        //     return $http.get('theTree/dashboard/tree').then(function(data) {
        //         console.log("all trees from mongo2 ", data.data);
        //         return data.data;
        //     })
        // }
    }

});



//TOKEN FACTORY
app.factory("AuthFactoryToken", function($window) {
    return {
        //it will look like this: authFactoryToken.setToken(token); ----> and it will be saved on the browser
        setToken: function(token) {
            if (token) {
                $window.localStorage.setItem("token", token); // if there is a token
            } else {
                $window.localStorage.removeItem("token"); // else, there is no token (without parameters)------------------------------------------
            }
        },
        //with this func we can get the token from localStorage and use the info if we needed
        getToken: function() {
            return $window.localStorage.getItem("token"); // THIS WILL RETURN IF THE USER IS LOGGED IN
        }
    };
});

//WAY TO ATTACHE TOKENS TO EVERY REQUEST
app.factory('TokenInRequestFactory', ["AuthFactoryToken", function(AuthFactoryToken) {
    var tokenInRequestFactory = {};

    tokenInRequestFactory.request = function(config) {
        var token = AuthFactoryToken.getToken();
        // console.log("config BEFORE ", config);
        if (token) { // if there is a TOKEN, put it in the headers!!!
            config.headers['x-access-token'] = token;
            // console.log("Response TOKEN ", token);
            // console.log("config AFTER ", config);
        }
        return config;
    };
    return tokenInRequestFactory;
}]);

app.config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push('TokenInRequestFactory');
}]);