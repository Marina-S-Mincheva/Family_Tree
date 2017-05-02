var allTrees = [];
app.controller("DashboardController", function($scope, UserService) {
    $scope.welcome = "Welcome to your dashboard ";
    $scope.search = "";
    $scope.isClicked = false;
    $scope.isVisible = false;
    
    //TO CLEAR SEARCH FIELD
    $scope.clearSearch = function() {
        $scope.search = "";
    }

    //SAVE THE TREE ON CLICK
    $scope.saveTree = function() {
        UserService.getUser().then(function(data, err) {
            $scope.email = data.data.email;
            $scope.mail = { email: data.data.email };
            familyArray.push($scope.mail);

            UserService.saveTree(familyArray).then(function(data) {
                if (data.success) {
                    // console.log("data treeeee dashhh ", data.tree);
                    // $scope.message = data.message;
                    $scope.treeFamily = data;
                    // console.log("emaill ", data);
                } else {
                    $scope.message = data.success;
                }
            })
        })
    }

    //TAKE THE TREES FROM THE SERVER SIDE ON CLICK
    $scope.findTrees = function() {
        $scope.loadMeFirst = true;
        UserService.getAllTreesNames().then(function(data) {
            var all = [];
            data.forEach(function(res) {
                all.push(res.tree);
            });
            $scope.isVisible = $scope.isVisible ? false : true;
            $scope.tree = all;
            allTrees = all.slice();
            // console.log("ALL ", all);
        })
    }
});