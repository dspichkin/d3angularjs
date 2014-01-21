'use strict';

/* Directives */


angular.module('myApp.directives', ['d3']).
  directive('barChart', ['d3Service', function(d3Service) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
/*
angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
*/