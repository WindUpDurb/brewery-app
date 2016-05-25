"use strict";

var app = angular.module("nameOfApp", ["ui.router"]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state("home", {
            url : "/"
        })


    $urlRouterProvider.otherwise("/");
});
"use strict";

var app = angular.module("nameOfApp");

app.controller("mainController", function () {
    console.log("Main Controller");
});
"use strict";

var app = angular.module("nameOfApp");

app.service("someService", function () {

});
