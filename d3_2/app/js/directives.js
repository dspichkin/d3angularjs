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
                panSpeed = 100,
                panBoundary = 50,
                panTimer = false,
                domNode = null,
                dragStarted = null,
                nodes,
                nodeHeight = 70,
                nodeWidth = 100,
                i = 0;
            

            // sort the tree according to the node names
            //var comparator = function(a, b) {
            //        return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : b.name.toLowerCase() > a.name.toLowerCase() ? -1 : 0;
            //};
            var comparator = function(a, b) {
                    return b.id < a.id ? 1 : b.id > a.id ? - 1 : 0;
            };

            //var separation = function(a, b) {
            //  return (a.parent == b.parent ? 1 : 2) * 200;
            //};

            //console.log()

            var tree = d3.layout.tree()
                            .children(function(d){
                                return (!d.contents || d.contents.length === 0) ? null : d.contents;
                            }).nodeSize([nodeHeight, nodeWidth]);
                            //.separation(separation)
                            //.size([viewerHeight, viewerWidth]);
            

           


            function pan(domNode, direction) {
                var speed = panSpeed,
                    translateX = null,
                    translateY = null;
                if (panTimer) {
                    clearTimeout(panTimer);
                    var translateCoords = d3.transform(svg.attr("transform"));
                    //console.log(translateCoords.translate[0])
                    if (direction == 'left' || direction == 'right') {
                        translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                        translateY = translateCoords.translate[1];
                    } else if (direction == 'up' || direction == 'down') {
                        translateX = translateCoords.translate[0];
                        translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
                    }
                    //console.log(direction, translateX)
                    //var scaleX = translateCoords.scale[0];
                    //var scaleY = translateCoords.scale[1];
                    //var scale = zoomListener.scale();
                    //svg.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                    svg.transition().attr("transform", "translate(" + translateX + "," + translateY + ")");
                    //d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                    //zoomListener.scale(zoomListener.scale());
                    zoomListener.translate([translateX, translateY]);
                    
                    panTimer = setTimeout(function() {
                        pan(domNode, direction);
                    }, 50);
                }
            }



            // Define the zoom function for the zoomable tree
            function zoom() {
                svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
            }
            // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
            // 0.1, 3
            var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom); //.scaleExtent([1, 10])


            var svg = d3.select(ele[0])
                .append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                
                //.attr("class", "overlay")
                .call(zoomListener)
                .append('g')
                .attr('transform', 'translate(50, 0)');


            //var diagonal = d3.svg.diagonal()
            //        .projection(function(d){ return [d.x, d.y];});

            var diagonal = d3.svg.diagonal()
                .projection(function (d) {
                return [d.x + nodeWidth / 2, d.y + nodeHeight / 2];
            });

            

            // Toggle children on click.
            function toggleChildren(d) {
                //console.log(d.contents, d._contents)
                if (d.contents) {
                    d._contents = d.contents;
                    d.contents = null;
                } else if (d._contents) {
                    d.contents = d._contents;
                    d._contents = null;
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


                    // get coords of mouseEvent relative to svg container to allow for panning
                    var relCoords = d3.mouse(ele[0]);
                    var oldTime = panTimer;
                    //console.log(relCoords, viewerWidth + 100)
                    //if (relCoords[0] > viewerWidth) relCoords[0] = viewerWidth;

                    if (
                        (relCoords[0] < viewerWidth + 100) && (relCoords[0] > 0) &&
                        (relCoords[1] < viewerHeight + 100) && (relCoords[1] > 0)
                        ){
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
                     }
                   

                    //console.log(oldTime, panTimer)



                    d.x += d3.event.dx;
                    d.y += d3.event.dy;
                    //var node = d3.select(this);
                    
                    var translate = d3.transform(domNode.getAttribute("transform")).translate;
                    var x = d3.event.dx + translate[0],
                        y = d3.event.dy + translate[1];
                    d3.select(domNode).attr("transform", "translate(" + x + "," + y + ")");


                    updateTempConnector();
                })
                .on("dragend", function(d){
                    domNode = this;
                    clearTimeout(panTimer);

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



                        //sortTree();
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


                // Up selected element front of hoved element
                svg.selectAll(".node").sort(function(a, b) {
                    if (a.id == draggingNode.id) {return 1;}
                    else {
                        if (b.id == draggingNode.id){
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });

                // Recursive select all chidlren
                var selectChild = function(obj, storage){
                    obj.forEach(function(o){
                        storage.push(o);
                        if (o.children){
                            selectChild(o.children, storage);
                        }
                    });
                    return storage;
                };
                // Remove selected nodes
                if (d.contents) {
                    var childrenNodes = [];
                    svg.selectAll("g.node")
                        .data(nodes, function(d) {
                            if (d.hasOwnProperty('id')){
                                return d.id;
                            }
                        }).filter(function(d, i) {
                            if (d.id == draggingNode.id) {
                                if (d.children){
                                    childrenNodes = selectChild(d.children, []);
                                }
                            }
                        });

                    svg.selectAll("g.node")
                        .data(childrenNodes, function(d) {
                            if (d.hasOwnProperty('id')){
                                return d.id;
                            }
                        })
                        .remove();
                    
                }
                svg.selectAll("path.link").remove();
                // remove parent link using name
                /*
                svg.selectAll('path.link').filter(function(d, i) {
                    if (d.target.name == draggingNode.name) {
                        return true;
                    }
                    return false;
                }).remove();
                */
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
                            source: {x: selectedNode.x, y: selectedNode.y},
                            target: {x: draggingNode.x, y:draggingNode.y}
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

                //tree = tree.size([viewerHeight, viewerWidth]);
                tree = tree.nodeSize([nodeHeight, nodeWidth]);
                nodes = tree.nodes(scope.data).reverse();
                var links = tree.links(nodes);

                // Normalize for fixed-depth.
                nodes.forEach(function (d) {
                    d.y = d.depth * 180;
                });

                tree.sort(comparator);

                

                
                var link = svg.selectAll('path.link')
                        .data(links, function(d){
                            return d.target.id;
                        });

                link.enter().insert('path', 'g')
                    .attr('class', 'link')
                    .attr("x", nodeWidth / 2)
                    .attr("y", nodeHeight / 2)
                    .attr("d", function (d) {
                        var o = {
                            x: data.x0,
                            y: data.y0
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    });
                // Transition links to their new position.
                link.transition()
                    .duration(750)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(750)
                    .attr("d", function (d) {
                        var o = {
                            x: data.x,
                            y: data.y
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .remove();


                // Create node
                

                var node = svg.selectAll(".node")
                        .data(nodes, function(d) {
                            return d.id || (d.id = ++i);
                        });

                var nodeEnter = node.enter().append("g")
                        .attr('class', 'node')
                        .attr("transform", function (d) {
                            return "translate(" + data.x0 + "," + data.y0 + ")";
                        })
                        .on('click', clickToggleChildren);
                
               

                // Main node boundry
                nodeEnter.append("rect")
                    .style("fill", "white")
                    .style("stroke", "green")
                    .attr("x", function (d) { return d.x - 10; })
                    .attr("y", function (d) { return d.y - 10; })
                    .attr("width", 100)
                    .attr("height", nodeHeight);

               

                 // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(750)
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                
                nodeUpdate.select("rect")
                    .attr("width", nodeWidth)
                    .attr("height", nodeHeight)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });
                     
                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                 // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                        .duration(750)
                        .attr("transform", function (d) {
                            return "translate(" + data.x + "," + data.y + ")";
                        })
                        .remove();

                nodeExit.select("rect")
                    .attr("width", nodeWidth)
                    .attr("height", nodeHeight)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);

/*
                nodeEnter.append("circle")
                    .attr("r", 0)
                    .attr('class', 'nodeCircle')
                    .attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; })
                    //.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    .style("fill", function(d) {
                        return d._contents ? "lightsteelblue" : "#fff";
                    })
                    .on('click', clickDrag);

                nodeEnter.select("circle.nodeCircle")
                    .attr("r", 6)
                    .style("fill", function(d) {
                        return d._contents ? "lightsteelblue" : "#fff";
                    });
*/
                // Rectange for toggles chidlren
                nodeEnter.append("rect")
                    .attr("x", function (d) { return d.x - 9; })
                    .attr("y", function (d) { return d.y + (nodeHeight - 31); })
                    .attr("width", function(d){
                        if (((typeof d.contents !== 'undefined') && (d.contents !== null) && (d.contents.length > 0)) ||
                            ((typeof d._contents !== 'undefined') && (d._contents !== null) && (d._contents.length > 0))){
                            return nodeWidth-2;
                        }
                    })
                    .attr("height", function(d){
                        if (((typeof d.contents !== 'undefined') && (d.contents !== null) && (d.contents.length > 0)) ||
                            ((typeof d._contents !== 'undefined') && (d._contents !== null) && (d._contents.length > 0))){
                            return 20;
                        }
                    })
                    .style("fill", function(d){ return d._contents ? "steelblue" : "lightsteelblue";})
                    //.attr("transform", function(d) { return "translate(" + (parseInt(d.y, 10) + 10) + "," + d.x + ")"; })
                    //.on('click', clickToggleChildren);
 /*               
                // phantom node to give us mouseover in a radius around it
                nodeEnter.append("rect")
                    .attr('class', 'ghostCircle')
                    .style("fill", "red")
                    .attr("x", function (d) { return d.x - 15; })
                    .attr("y", function (d) { return d.y - 15; })
                    .attr('width', 110)
                    .attr('height', nodeHeight + 10)
                    .attr("opacity", 0.2)
                    .attr('pointer-events', 'mouseover')
                    .on("mouseover", function(node) {
                        overCircle(node);
                    })
                    .on("mouseout", function(node) {
                        outCircle(node);
                    });
                    
                
                nodeEnter.append('text')
                    //.attr('dx', function(d){ return d.contents ? -12: 10;})
                    .attr('dx', 10)
                    .attr('dy', 3)
                    //.style('text-anchor', function(d){ return d.contents ? 'end': 'start';})
                    .style('text-anchor', 'start')
                    .text(function(d){ return d.name;})
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
*/


               


                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });


                //var newNodes = [{x:150, y:203, name: 'new'}];
                
                //svg.selectAll('.lonely')
                //    .data(newNodes).enter().append('circle')
                //    .attr('r', 5)
                //    .attr("class", "lonely")
                //    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                

                
            }; // end render

            scope.render(scope.data);

            
        });
      }};
}]);