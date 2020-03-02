import * as d3 from "d3";
import garryOakData from "./garry_oak_grid.json";
import cherryData from "./cherry_blossom_grid.json";
import chestnutData from "./horse_chestnut_grid.json";
import streetData from "./streets.json";
import waterData from "./water.json";

function treeColours (val) {
    if (0.000000000000000 <= val && val < 0.990000000000000) {
        return "rgba(255,255,255,0)";
    }
    if (0.990000000000000 <= val && val < 1.990000000000000) {
        return "rgba(133,230,67,255)";
    }
    if (1.990000000000000 <= val && val < 5.990000000000000) {
        return "rgba(83,191,14,255)";
    }
    if (5.990000000000000 <= val && val < 114.285714285714292) {
        return "rgba(62,165,11,255)";
    }
    if (114.285714285714292 <= val && val < 142.857142857142861) {
        return "rgba(41,139,9,255)";
    }
    if (142.857142857142861 <= val && val < 171.428571428571445) {
        return "rgba(20,113,6,255)";
    }
    if (171.428571428571445 <= val && val < 200.000000000000000) {
        return "rgba(55,104,0,255)";
    }
}

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const svg = d3.select("#trees-viz")
      .append("svg")
      .attr("height", windowHeight)
      .attr("width", windowWidth);

const projection = d3.geoMercator()
      .fitExtent([[0, 0], [windowWidth, windowHeight]], streetData);

const pathGenerator = d3.geoPath()
      .projection(projection);

const water = svg.selectAll('path.water')
      .data(waterData.features)
      .enter()
      .append('path')
      .attr('class', 'water')
      .attr('d', pathGenerator)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('fill', '#0011ee');

const streets = svg.selectAll('path.street')
      .data(streetData.features)
      .enter()
      .append('path')
      .attr('class', 'street')
      .attr('d', pathGenerator)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

const treeGrids = [ garryOakData, chestnutData, cherryData ].map(function (data) {
    return svg.selectAll('path.' + data.name)
        .data(data.features)
        .enter()
        .append('path')
        .attr('class', data.name)
        .attr('d', pathGenerator)
        .attr('stroke-width', 0)
        .attr('opacity', 0)
        .attr('fill', function (d) {
            return treeColours(d.properties.NUMPOINTS);
        });
});

const [ garryOaks, horseChestnuts, cherryBlossoms ] = treeGrids;

water.on("click", function (e) {
    horseChestnuts.transition()
        .styleTween('opacity', function () {
            return d3.interpolate(0, 1);
        });
});
