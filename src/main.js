import { geoMercator, geoPath } from "d3-geo";
import { select, selectAll } from "d3-selection";
import * as topojson from "topojson-client";

import basemapData from "./basemap.json";
import { store, toggleClass } from "./state.js";


function _contains (lst, val) {
    return lst.findIndex(x => x == val) >= 0;
}

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const container = document.querySelector("#container");
container.style.height = windowHeight + "px";

const streetData = topojson.feature(basemapData, "streets");
const waterData = topojson.feature(basemapData, "water");
const parksData = topojson.feature(basemapData, "parks");
const ballData = topojson.feature(basemapData, "bball");

const viz = select("#viz")
      .append("svg")
      .attr("height", "100%")
      .attr("width", "100%");

const projection = geoMercator()
      .fitExtent([[0, 0], [windowWidth * .60, windowHeight]],
                 streetData);

const pathGenerator = geoPath()
      .projection(projection);

const parks = viz.selectAll("path.park")
      .data(parksData.features)
      .enter()
      .append("path")
      .attr("class", "park")
      .attr("d", pathGenerator)
      .attr("stroke-width", 0)
      .attr("fill", function (d) {
          if (d.properties.park_type == "Beach") {
              return "#bdad84";
          } else {
              return "#84bd84";
          }
      });

const streets = viz.selectAll("path.street")
      .data(streetData.features)
      .enter()
      .append("path")
      .attr("class", "street")
      .attr("d", pathGenerator)
      .attr("stroke-width", function (d) {
          return d.properties.Width * .15;
      })
      .attr("fill", "none");

const water = viz.selectAll("path.water")
      .data(waterData.features)
      .enter()
      .append("path")
      .attr("class", "water")
      .attr("d", pathGenerator)
      .attr("stroke-width", 0)
      // .attr("stroke", "#333")
      .attr("fill", "#8497bd");

const ballCourts = viz.selectAll("circle.bball_court")
      .data(ballData.features)
      .enter()
      .append("circle")
      .attr("class", "ball_court")
      .attr("cx", function (d) {
          return projection(d.geometry.coordinates)[0];
      })
      .attr("cy", function (d) {
          return projection(d.geometry.coordinates)[1];
      });

const streetClassControls = select("#street-classes");
const parkTypeControls = select("#park-types");
const courtInfoDisplay  = select("#court-info");
const streetNameDisplay = select("#streetname-display");

const streetClassButtons = streetClassControls.selectAll("div.street-class-button")
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

const parkTypeButtons = parkTypeControls.selectAll("div.park-type-button")
      .data([
          "City Park",
          "Neighbourhood Park",
          "Cemetary"
      ])
      .enter()
      .append("div")
      .attr("class", "park-type-button")
      .text(function (d) { return d; });

/** FEEDBACK */

function updateStreetClasses () {
    let classes = store.getState().get("showClasses");
    streets.classed("shown", function (d) {
        return _contains(classes, d.properties.Class) ? true : false;
    });
    streetClassButtons.classed("shown", function (d) {
        return _contains(classes, d) ? true : false;
    });
}

function updateParkTypes () {
    
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

    const tmpl = `<div class='court-name'>
                      <h2>${ info.name }</h2>
                  </div>
                  <div class='intersect-streets'>
                      <h3>${ intersectStreets.join(" @ ") }</h3>
                  </div>
                  <div class='court-image'>
                      <img src=${ imgSrc }>
                  </div>`;

    courtInfoDisplay.selectAll("div")
        .remove();

    courtInfoDisplay.html(tmpl);

    courtInfoDisplay.select("div.intersect-streets")
       .on("mouseover", function () {
           highlightStreet(intersectStreets);
           updateStreetNameDisplay(intersectStreets.join(" @ "));
       });
}

/** EVENT BINDINGS */

streets.on("mouseover", function (d) {
    updateStreetNameDisplay(d.properties.StreetName);
    highlightStreet([d.properties.StreetName]);
});

streetClassButtons.on("click", function (d) {
    store.dispatch(toggleClass(d));
    updateStreetClasses();
});

ballCourts.on("mouseover", function (d) {
    streets.classed("highlighted", false);
    streetNameDisplay.empty();
});

ballCourts.on("click", function (d) {
    ballCourts.classed("active", false);
    select(this).classed("active", true);
    updateCourtInfoDisplay(d.properties);
});

/** INITIALIZATION */

updateStreetClasses();
select(ballCourts.nodes()[0]).dispatch("click");
