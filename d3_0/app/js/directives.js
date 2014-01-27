angular.module('myApp.directives', ['d3'])
.directive('d3Bars', ['$window', '$timeout', 'd3Service',
  function($window, $timeout, d3Service) {
    return {
      restrict: 'A',
      scope: {
        data: '=',
        label: '@',
        onClick: '&'
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

            function zoomed() {
                console.log('zoomed')
                //svg.select(".x.axis").call(xAxis);
                //svg.select(".y.axis").call(yAxis);
                svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
            }


            var zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on("zoom", zoomed);

            var svg = d3.select(ele[0])
                .append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                .append('g')
                .attr('transform', 'translate(50, 0)')
                .call(zoom);
            
            var diagonal = d3.svg.diagonal()
                    .projection(function(d){ return [d.y, d.x];});
         

            if (!scope.data) {
              console.log("Data is null");
              return;
            }

            var tree = d3.layout.tree()
                .size([viewerHeight, viewerWidth]);

            var nodes = tree.nodes(scope.data),
                links = tree.links(nodes);

            


            var link = svg.selectAll('.link')
                  .data(links)
                  .enter().append('path')
                  .attr('class', 'link')
                  .attr('d', diagonal);

            var node = svg.selectAll(".node")
                  .data(nodes)
                  .enter().append("g")
                  .attr('class', 'node')
                  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                  //.attr('pointer-events', 'mouseover')
                  //.call(circleDragger);

            node.append("circle")
              .attr("r", 5);

            // phantom node to give us mouseover in a radius around it
            node.append("circle")
              .attr("r", 40)
              .attr("opacity", 0)
              //.attr('pointer-events', 'mouseover')
              //.on('mouseover', overCircle)
              //.on('mouseout', outCircle);
              

            node.append('text')
              .attr('dx', function(d){ return d.children ? -12: 10;})
              .attr('dy', 3)
              .style('text-anchor', function(d){ return d.children ? 'end': 'start';})
              .text(function(d){ return d.name;});

        });
      }};
}]);