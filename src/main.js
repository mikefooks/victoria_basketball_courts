import * as d3_geo from "d3-geo";
import * as d3_selection from "d3-selection";
import * as topojson from "topojson-client";

import basemapData from "./basemap.json";
import { store } from "./state.js";


function _toArray (nodeLst) {
    return Array.prototype.slice.call(nodeLst, 0);
}

function _contains (lst, val) {
    return lst.findIndex(x => x == val) >= 0;
}

function _unique (lst) {
    return lst.filter(function (val, idx, self) {
        return self.indexOf(val) == idx;
    });
}

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const streetData = topojson.feature(basemapData, "streets");
const waterData = topojson.feature(basemapData, "water");
const ballData = topojson.feature(basemapData, "bball");

const viz = d3_selection.select("#viz")
      .append("svg")
      .attr("height", windowHeight)
      .attr("width", "100%");

const projection = d3_geo.geoMercator()
      .fitExtent([[0, 0], [windowWidth * .75, windowHeight]], streetData);

const pathGenerator = d3_geo.geoPath()
      .projection(projection);

const water = viz.selectAll('path.water')
      .data(waterData.features)
      .enter()
      .append('path')
      .attr('class', 'water')
      .attr('d', pathGenerator)
      .attr('stroke-width', 0)
      .attr('fill', '#8497bd');

const streets = viz.selectAll('path.street')
      .data(streetData.features)
      .enter()
      .append('path')
      .attr('class', 'street')
      .attr('d', pathGenerator)
      .attr('stroke-width', function (d) {
          return d.properties.Width * .1;
      })
      .attr('fill', 'none');

const ballCourts = viz.selectAll('circle.bball_court')
      .data(ballData.features)
      .enter()
      .append('circle')
      .attr('class', 'bball_court')
      .attr('r', '8px')
      .attr('fill', 'red')
      .attr('cx', function (d) {
          return projection(d.geometry.coordinates)[0];
      })
      .attr('cy', function (d) {
          return projection(d.geometry.coordinates)[1];
      });

const controls = d3_selection.select("#street-classes");
const streetNameDisplay = d3_selection.select("#streetname-display");
const classButtons = controls.selectAll("div.street-class-button")
      .data([
          "Local",
          "Downtown Core",
          "Arterial",
          "Secondary Arterial",
          "Collector",
          "Secondary Collector"
      ])
      .enter()
      .append("div")
      .attr("class", "street-class-button")
      .classed("shown", function (d) {
          let shownClasses = store.getState().get("showClasses");
          return _contains(shownClasses, d) ? true : false;
      })
      .text(function (d) { return d; });

/**
   FEEDBACK
*/

function updateStreetClasses () {
    let classes = store.getState().get("showClasses");
    streets.classed("shown", function (d) {
        return _contains(classes, d.properties.Class) ? true : false;
    });
}

function highlightStreet (streetName) {
    streets.classed("highlighted", function (d) {
        return streetName == d.properties.StreetName ? true : false;
    });
}

function updateStreetNameDisplay (streetName) {
    streetNameDisplay.text(streetName);
}

/** STATE CHANGES */

/** EVENT BINDINGS */

streets.on("mouseover", function (d) {
    updateStreetNameDisplay(d.properties.StreetName);
    highlightStreet(d.properties.StreetName);
});

/** INITIALIZATION */

updateStreetClasses();
