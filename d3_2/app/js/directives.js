'use strict'
/*global angular: false */

angular.module('myApp.directives', ['d3'])
.directive('d3Bars', ['$window', '$timeout', 'd3Service',
  function($window, $timeout, d3Service) {
    return {
      restrict: 'A',
      scope: {
        data: '='//,
        //label: '@',
        //onClick: '&'
      },
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
 
            //var renderTimeout;
            var width = 340,
                height = 400;

            var cluster = d3.layout.cluster()
                            .children(function(d){
                                return (!d.contents || d.contents.length === 0) ? null : d.contents;
                            })
                            .size([height, width]);

            var diagonal = d3.svg.diagonal()
                    .projection(function(d){ return [d.y, d.x];});

            var svg = d3.select(ele[0])
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', '0 0 400 500')
                .append('g')
                .attr('transform', 'translate(20, 20)');
            
        
                
            //$window.onresize = function() {
            //    console.log("@@@@@ ", ele[0].offsetWidth)
            //    scope.$apply();
            //};

            scope.$watch(function() {
                return angular.element($window)[0].innerWidth;
            }, function() {
                scope.render(scope.data);
            });

            //scope.$watch('data', function(newData) {
            //    scope.render(newData);
            //}, true);
 


            scope.render = function(data) {
                svg.selectAll('*').remove();

                if (!data) return;
                //if (renderTimeout) clearTimeout(renderTimeout);

                var nodes = cluster.nodes(scope.data),
                    links = cluster.links(nodes);
                

                var link = svg.selectAll('.link')
                        .data(links)
                        .enter().append('path')
                        .attr('class', 'link')
                        .attr('d', diagonal);
                var node = svg.selectAll('.node')
                        .data(nodes)
                        .enter().append('g')
                        .attr('class', 'node')
                        .attr('transform', function(d){ return 'translate(' + d.y + ',' + d.x + ')';});

                node.append('circle')
                    .attr('r', 5);

                node.append('text')
                    .attr('dx', function(d){ return d.children ? -12: 10;})
                    .attr('dy', 3)
                    .style('text-anchor', function(d){ return d.children ? 'end': 'start';})
                    .text(function(d){ return d.name;});
            };
        });
      }};
}]);