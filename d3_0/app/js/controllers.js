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
    $scope.data = {
       "name": "flare",
       "children": [
        {
         "name": "analytics",
         "children": [
          {
           "name": "cluster",
           "children": [
            {"name": "AgglomerativeCluster", "size": 3938},
            {"name": "CommunityStructure", "size": 3812},
            {"name": "MergeEdge", "size": 743}
           ]
          },
          {
           "name": "graph",
           "children": [
            {"name": "BetweennessCentrality", "size": 3534},
            {"name": "LinkDistance", "size": 5731}
           ]
          }
         ]
        }
       ]
      };
  }]);