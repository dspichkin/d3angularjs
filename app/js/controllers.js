'use strict';

/* Controllers */
/*
angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }]);
*/
angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', function($scope){
    $scope.greeting = "Resize the page to see the re-rendering";
    $scope.data = [
      {name: "Greg", score: 98},
      {name: "Ari", score: 96},
      {name: 'Q', score: 75},
      {name: "Loser", score: 48}
    ];
  }]);