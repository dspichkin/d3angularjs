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
                domNode = null,
                dragStarted = null,
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
                svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
            }
            // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
            // 0.1, 3
            var zoomListener = d3.behavior.zoom().on("zoom", zoom); //.scaleExtent([1, 10])


            var svg = d3.select(ele[0])
                .append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                .attr('transform', 'translate(50, 0)')
                //.attr("class", "overlay")
                .call(zoomListener)
                .append('g');


            var diagonal = d3.svg.diagonal()
                    .projection(function(d){ return [d.y, d.x];});

            
            

            // Toggle children on click.
            function toggleChildren(d) {
                if (d.contents) {
                    d._contents = d.contents;
                    d.contents = [];
                } else if (d._contents) {
                    d.contents = d._contents;
                    d._contents = [];
                }
                return d;
            }
            var clickToggleChildren = function(d){
                if (d3.event.defaultPrevented) return;
                d = toggleChildren(d);

                scope.render(d);
            };

            var clickDrag = function(d){
                d3.select(this.parentNode).call(circleDragger);
            };


            var overCircle = function(d){
                selectedNode = d;
                updateTempConnector();
            };

            var outCircle = function(d){
                selectedNode = null;
                updateTempConnector();
            };

            var circleDragger = d3.behavior.drag()
                .on("dragstart", function(d){
                    draggingNode = d;
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    dragStarted = true;

                    // it's important that we suppress the mouseover event on the node being dragged.
                    // Otherwise it will absorb the mouseover event and the underlying node will not detect it
                    d3.select(this).attr( 'pointer-events', 'none' );
                })
                .on("drag", function(d) {

                    if (dragStarted) {
                        domNode = this;
                        initiateDrag(d, domNode);
                    }



                    d.x += d3.event.dy;
                    d.y += d3.event.dx;
                    //var node = d3.select(this);
                    
                    var translate = d3.transform(domNode.getAttribute("transform")).translate;
                    var x = d3.event.dx + translate[0],
                        y = d3.event.dy + translate[1];
                    d3.select(domNode).attr("transform", "translate(" + x + "," + y + ")");


                    updateTempConnector();
                })
                .on("dragend", function(d){
                    domNode = this;
                    if (selectedNode) {
                        // now remove the element from the parent, and insert it into the new elements children
                        var index = draggingNode.parent.children.indexOf(draggingNode);
                        if (index > -1) {
                            draggingNode.parent.contents.splice(index, 1);
                        }

                        if (typeof selectedNode.contents !== 'undefined' ) {
                                selectedNode.contents.push(draggingNode);
                        } else {
                            selectedNode.contents = [];
                            selectedNode.contents.push(draggingNode);
                        }




                        endDrag();
                    } else {
                        endDrag();
                    }
                    
                });

            var initiateDrag = function(d, domNode) {
                draggingNode = d;
                d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
                d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
                d3.select(domNode).attr('class', 'node activeDrag');




                //console.log(nodesExit)
                /*
                svg.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id;
                    })
                    .filter(function(d, i) {
                        if (d.id == draggingNode.id) {
                            return false;
                        }
                        return true;
                    }).remove();
                */
                // remove parent link using name
                svg.selectAll('path.link').filter(function(d, i) {
                    if (d.target.name == draggingNode.name) {
                        return true;
                    }
                    return false;
                }).remove();

                dragStarted = null;
            };

            var endDrag = function(){
                selectedNode = null;
                d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
                d3.select(domNode).attr('class', 'node');
                // now restore the mouseover event or we won't be able to drag a 2nd time
                d3.select(domNode).attr( 'pointer-events', '' );
                updateTempConnector();

                if (draggingNode !== null) {
                    scope.render(scope.data);
                    //centerNode(draggingNode);
                    draggingNode = null;
                }
                
            };

            var updateTempConnector = function(){
               
                var data = [];
                if (draggingNode !== null && selectedNode !== null){
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
                        .attr('d', diagonal);
                        //.attr('pointer-events', 'none');

                var node = svg.selectAll(".node")
                        .data(nodes, function(d) {
                            return d.id || (d.id = ++i);
                        });

                var nodeEnter = node.enter().append("g")
                        .attr('class', 'node');
                        //.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                        //.call(circleDragger);
                        
                        

                node.append("circle")
                    .attr("r", 0)
                    .attr('class', 'nodeCircle')
                    .attr("cx", function (d) { return d.y; })
                    .attr("cy", function (d) { return d.x; })
                    //.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    .style("fill", function(d) {
                        return d._contents ? "lightsteelblue" : "#fff";
                    })
                    .on('click', clickDrag);

                node.select("circle.nodeCircle")
                    .attr("r", 6)
                    .style("fill", function(d) {
                        return d._contents ? "lightsteelblue" : "#fff";
                    });

                node.append("rect")
                    .attr("x", function (d) { return d.y + 10; })
                    .attr("y", function (d) { return d.x - 10; })
                    .attr("width", function(d){ if (d.contents || d._contents ){ if (d.contents.length > 0 || d._contents.length >0 ) console.log(d.contents); return 10;}})
                    .attr("height", function(d){ if (d.contents || d._contents) return 20;})
                    .style("fill", "red")
                    //.attr("transform", function(d) { return "translate(" + (parseInt(d.y, 10) + 10) + "," + d.x + ")"; })
                    .on('click', clickToggleChildren);
                
                // phantom node to give us mouseover in a radius around it
                nodeEnter.append("circle")
                    .attr("r", 40)
                    .attr('class', 'ghostCircle')
                    .style("fill", "red")
                    .attr("opacity", 0.2)
                    //
                    .attr("cx", function (d) { return d.y; })
                    .attr("cy", function (d) { return d.x; })
                    //
                    .attr('pointer-events', 'mouseover')
                    //.on('mouseover', overCircle)
                    //.on('mouseout', outCircle);
                    .on("mouseover", function(node) {
                        overCircle(node);
                    })
                    .on("mouseout", function(node) {
                        outCircle(node);
                    });
                    
                
                node.append('text')
                    .attr('dx', function(d){ return d.contents ? -12: 10;})
                    .attr('dy', 3)
                    .style('text-anchor', function(d){ return d.contents ? 'end': 'start';})
                    .text(function(d){ return d.name;})
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                /*
                var newNodes = [{x:150, y:203, name: 'new'}];
                
                svg.selectAll('.lonely')
                    .data(newNodes).enter().append('circle')
                    .attr('r', 5)
                    .attr("class", "lonely")
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    */
                
            };

            scope.render(scope.data);

            
        });
      }};
}]);