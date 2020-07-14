import * as d3_geo from "d3-geo";
import { select, selectAll } from "d3-selection";
import * as topojson from "topojson-client";

import basemapData from "./basemap.json";
import { store, toggleClass } from "./state.js";


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

const viz = select("#viz")
      .append("svg")
      .attr("height", windowHeight - 16)
      .attr("width", "100%");

const projection = d3_geo.geoMercator()
      .fitExtent([[0, 0], [windowWidth * .60, windowHeight]], streetData);

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
          return d.properties.Width * .15;
      })
      .attr('fill', 'none');

const ballCourts = viz.selectAll('circle.bball_court')
      .data(ballData.features)
      .enter()
      .append('circle')
      .attr('class', 'ball_court')
      .attr('cx', function (d) {
          return projection(d.geometry.coordinates)[0];
      })
      .attr('cy', function (d) {
          return projection(d.geometry.coordinates)[1];
      });

const controls = select("#street-classes");
const courtInfoDisplay  = select("#court-info");
const streetNameDisplay = select("#streetname-display");

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

/** FEEDBACK */

function updateStreetClasses () {
    let classes = store.getState().get("showClasses");
    streets.classed("shown", function (d) {
        return _contains(classes, d.properties.Class) ? true : false;
    });
    classButtons.classed("shown", function (d) {
        return _contains(classes, d) ? true : false;
    });
}

function highlightStreet (streetNames) {
    streets.classed("highlighted", function (d) {
        const streetIdx = streetNames.indexOf(d.properties.StreetName);
        return streetIdx >= 0 ? true : false;
    });
}

function updateStreetNameDisplay (streetName) {
    streetNameDisplay.text(streetName);
}

function updateCourtInfoDisplay (info) {
    const imgSrc = "https://mikefooks.com/basketball/" +
          info.image_link;

    const intersectStreets = info.intersect.split(",");

    courtInfoDisplay.selectAll("div")
        .remove();

    courtInfoDisplay.append("div")
        .classed("court-name", true)
        .append("h1")
        .text(info.name);

    courtInfoDisplay.append("div")
        .classed("intersect-streets", true)
        .on("mouseover", function () {
            highlightStreet(intersectStreets);
        })
        .append("h2")
        .text(function (d) {
            return intersectStreets[0]
                + " @ "
                + intersectStreets[1];
        });

    courtInfoDisplay.append("div")
        .classed("court-image", true)
        .append("img")
        .attr("src", imgSrc);
}

/** EVENT BINDINGS */

streets.on("mouseover", function (d) {
    updateStreetNameDisplay(d.properties.StreetName);
    highlightStreet([d.properties.StreetName]);
});

classButtons.on("click", function (d) {
    store.dispatch(toggleClass(d));
    updateStreetClasses();
});

ballCourts.on("mouseover", function (d) {
    select(this).classed("highlighted", true);
    streets.classed("highlighted", false);
    streetNameDisplay.empty();
});

ballCourts.on("mouseout", function (d) {
    select(this).classed("highlighted", false);
});

ballCourts.on("click", function (d) {
    updateCourtInfoDisplay(d.properties);
});


/** INITIALIZATION */

updateStreetClasses();
