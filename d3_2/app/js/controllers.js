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


      $scope.data = {
            name: "",
            contents: [
                {
                    name: "Applications",
                    contents: [
                        { name: "Mail.app" },
                        { name: "iPhoto.app" },
                        { name: "Keynote.app" },
                        { name: "iTunes.app" },
                        { name: "XCode.app" },
                        { name: "Numbers.app" },
                        { name: "Pages.app" }
                    ]
                },
                {
                    name: "System",
                    contents: []
                },
                {
                    name: "Library",
                    contents: [
                        {
                            name: "Application Support",
                            contents: [
                                { name: "Adobe" },
                                { name: "Apple" },
                                { name: "Google" },
                                { name: "Microsoft" }
                            ]
                        },
                        {
                            name: "Languages",
                            contents: [
                                { name: "Ruby" },
                                { name: "Python" },
                                { name: "Javascript" },
                                { name: "C#" }
                            ]
                        },
                        {
                            name: "Developer",
                            contents: [
                                { name: "4.2" },
                                { name: "4.3" },
                                { name: "5.0" },
                                { name: "Documentation" }
                            ]
                        }
                    ]
                },
                {
                    name: "opt",
                    contents: []
                },
                {
                    name: "Users",
                    contents: [
                        { name: "pavanpodila" },
                        { name: "admin" },
                        { name: "test-user" }
                    ]
                }
            ]
        };


  }
]);