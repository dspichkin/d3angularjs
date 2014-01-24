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
 
            var width = 500,
                height = 400,
                viewerWidth = ele[0].offsetWidth,
                selectedNode = null,
                draggingNode = null,
                i = 0;
            

            

            var tree = d3.layout.tree()
                            .children(function(d){
                                return (!d.contents || d.contents.length === 0) ? null : d.contents;
                            })
                            .size([height, width]);

            var svg = d3.select(ele[0])
                .append("svg")
                .attr("width", viewerWidth)
                .attr("height", height)
                .append('g')
                .attr('transform', 'translate(50, 0)');


            var diagonal = d3.svg.diagonal()
                    .projection(function(d){ return [d.y, d.x];});

            

            var overCircle = function(d){
                selectedNode = d;
                updateTempConnector();
                //console.log("in")
            };

            var outCircle = function(d){
                selectedNode = null;
                updateTempConnector();
                //console.log("out")
            };

            var circleDragger = d3.behavior.drag()
                .on("dragstart", function(d){
                    draggingNode = d;
                    d3.event.sourceEvent.stopPropagation();
                    // it's important that we suppress the mouseover event on the node being dragged.
                    // Otherwise it will absorb the mouseover event and the underlying node will not detect it
                    d3.select(this).attr( 'pointer-events', 'none' );
                })
                .on("drag", function(d) {
                    d.x += d3.event.dy;
                    d.y += d3.event.dx;
                    var node = d3.select(this);
                    //node.attr( { cx: d.x, cy: d.y } );
                    node.attr("transform", "translate(" + d.y + "," + d.x + ")");
                    updateTempConnector();
                })
                .on("dragend", function(d){
                    draggingNode = null;
                    // now restore the mouseover event or we won't be able to drag a 2nd time
                    d3.select(this).attr( 'pointer-events', '' );
                });

            var updateTempConnector = function(){
               
                //console.log("draggingNode", draggingNode);

                var data = [];
                if (draggingNode !== null && selectedNode !== null){
                    //console.log("!!")
                    //console.log("selectedNode", selectedNode);
                    //console.log("draggingNode", draggingNode);
                    data = [{
                            source: {x: selectedNode.y, y: selectedNode.x},
                            target: {x: draggingNode.y, y:draggingNode.x}
                            }];
                }

                var link = svg.selectAll('.templink').data(data);
                link.enter().append('path')
                    .attr('class', 'templink')
                    .attr('d', d3.svg.diagonal());
                    //.attr('pointer-events', 'none');
                
                link.attr('d', d3.svg.diagonal());
                link.exit().remove();
            };
            


            scope.render = function(data) {
                svg.selectAll('*').remove();

                if (!data) {
                    console.log("Data is null");
                    return;
                }

                var nodes = tree.nodes(scope.data),
                    links = tree.links(nodes);
                

                var link = svg.selectAll('.link')
                        .data(links)
                        .enter().append('path')
                        .attr('class', 'link')
                        .attr('d', diagonal)
                        .attr('pointer-events', 'none');

                var node = svg.selectAll(".node")
                        .data(nodes)
                        .enter().append("g")
                        .attr('class', 'node')
                        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                        .attr('pointer-events', 'mouseover')
                        .call(circleDragger);

                node.append("circle")
                    .attr("r", 5);
                
                // phantom node to give us mouseover in a radius around it
                node.append("circle")
                    .attr("r", 40)
                    .attr("opacity", 0)
                    .attr('pointer-events', 'mouseover')
                    .on('mouseover', overCircle)
                    .on('mouseout', outCircle);
                    
                
                node.append('text')
                    .attr('dx', function(d){ return d.children ? -12: 10;})
                    .attr('dy', 3)
                    .style('text-anchor', function(d){ return d.children ? 'end': 'start';})
                    .text(function(d){ return d.name;});

                /*
                var newNodes = [{x:150, y:203, name: 'new'}];
                
                svg.selectAll('.lonely')
                    .data(newNodes).enter().append('circle')
                    .attr('r', 5)
                    .attr("class", "lonely")
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    .call(circleDragger);
                */
            };

            scope.render(scope.data);

            
        });
      }};
}]);