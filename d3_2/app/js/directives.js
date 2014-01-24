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
                viewerHeight =  ele[0].offsetHeight,
                selectedNode = null,
                draggingNode = null,
                // panning variables
                panSpeed = 200,
                panBoundary = 20,
                panTimer = null,
                i = 0;
            

            

            var tree = d3.layout.tree()
                            .children(function(d){
                                return (!d.contents || d.contents.length === 0) ? null : d.contents;
                            })
                            .size([viewerHeight, viewerWidth]);
            
            function pan(domNode, direction) {
                //console.log("PAN")
                var speed = panSpeed,
                    translateX = null,
                    translateY = null;

                if (panTimer) {
                    clearTimeout(panTimer);
                    var translateCoords = d3.transform(svg.attr("transform"));
                    if (direction == 'left' || direction == 'right') {
                        translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                        translateY = translateCoords.translate[1];
                    } else if (direction == 'up' || direction == 'down') {
                        translateX = translateCoords.translate[0];
                        translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
                    }
                    var scaleX = translateCoords.scale[0];
                    var scaleY = translateCoords.scale[1];
                    var scale = zoomListener.scale();
                    svg.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                    d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                    zoomListener.scale(zoomListener.scale());
                    zoomListener.translate([translateX, translateY]);
                    panTimer = setTimeout(function() {
                        pan(domNode, speed, direction);
                    }, 50);
                }
            }



            // Define the zoom function for the zoomable tree
            function zoom() {
                console.log("zoom")
                svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
            }
            // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
            // 0.1, 3
            var zoomListener = d3.behavior.zoom().on("zoom", zoom); //.scaleExtent([1, 10])


            var svg = d3.select(ele[0])
                .append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                .append('g')
                .attr('transform', 'translate(50, 0)')
                //.attr("class", "overlay")
                .call(zoomListener);


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
                    //d3.select(this).attr( 'pointer-events', 'none' );
                })
                .on("drag", function(d) {
                    //console.log("DRAG",d3.select(ele[0]))
                    // get coords of mouseEvent relative to svg container to allow for panning
                    /*
                    var relCoords = d3.mouse(ele[0]);
                    //console.log("!!!", relCoords[0], panBoundary)
                    if (relCoords[0] < panBoundary){
                        panTimer = true;
                        pan(this, 'left');
                    } else if (relCoords[0] > (viewerWidth - panBoundary)) {
                        panTimer = true;
                        pan(this, 'right');
                    } else if (relCoords[1] < panBoundary) {
                        panTimer = true;
                        pan(this, 'up');
                    } else if (relCoords[1] > (viewerHeight - panBoundary)) {
                        panTimer = true;
                        pan(this, 'down');
                    } else {
                        try {
                            clearTimeout(panTimer);
                        } catch (e) {

                        }
                    }
                    */


                    d.x += d3.event.dy;
                    d.y += d3.event.dx;
                    var node = d3.select(this);
                    //node.attr( { cx: d.x, cy: d.y } );
                    node.attr("transform", "translate(" + d.y + "," + d.x + ")");
                    updateTempConnector();
                })
                .on("dragend", function(d){
                    if (selectedNode) {


                        endDrag();
                    } else {
                        endDrag();
                    }
                    
                });

            var endDrag = function(){
                draggingNode = null;
                // now restore the mouseover event or we won't be able to drag a 2nd time
                //d3.select(this).attr( 'pointer-events', '' );
                console.log(d3.select(this))
            };

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
                        //.attr('pointer-events', 'none');

                var node = svg.selectAll(".node")
                        .data(nodes)
                        .enter().append("g")
                        .attr('class', 'node')
                        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                        //.attr('pointer-events', 'mouseover')
                        .call(circleDragger);

                node.append("circle")
                    .attr("r", 5);
                
                // phantom node to give us mouseover in a radius around it
                node.append("circle")
                    .attr("r", 40)
                    .attr("opacity", 0)
                    //.attr('pointer-events', 'mouseover')
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