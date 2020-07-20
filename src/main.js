import { geoMercator, geoPath } from "d3-geo";
import { select, selectAll } from "d3-selection";
import { feature } from "topojson-client";

import basemapData from "./basemap.json";


/* TOOLS & UTILITIES */

function _contains (lst, val) {
    return lst.findIndex(x => x == val) >= 0;
}

/* given an array of dom elements,
   return those with a particular class. */
function _filterByClass (els, className) {
    return els.filter(function (b) {
        return b.classList.contains(className);
    });
}

/* if val in arr, remove val from arr.
   if val not in arr, add val to arr.
   returns a new arr */
function _unionOrDiff (arr, val) {
    let newArr = [];
    let containsFlag = false;
    arr.forEach(function (v) {
        if (v == val) {
            containsFlag = true;
        } else {
            newArr.push(v); 
        }
    });
    if (!containsFlag) {
        newArr.push(val);
    }
    return newArr;
}

/* SETUP & INITIAL RENDERING */

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const isMobile = window.matchMedia("screen and (max-width: 540px)").matches;

console.log("mobile mode: " + isMobile);

const container = document.querySelector("#container");
container.style.height = windowHeight + "px";

const streetData = feature(basemapData, "streets");
const waterData = feature(basemapData, "water");
const parksData = feature(basemapData, "parks");
const ballData = feature(basemapData, "bball");

const viz = select("#viz")
      .append("svg")
      .attr("height", isMobile ? windowWidth + "px" : "100%")
      .attr("width", isMobile ? windowWidth + "px" : "100%");

const projectionDims = isMobile ?
      [ windowWidth, windowWidth] :
      [ windowWidth * .6, windowHeight];

const projection = geoMercator()
      .fitExtent([[0, 0], projectionDims],
                  streetData);

const pathGenerator = geoPath()
      .projection(projection);

const parks = viz.selectAll("path.park")
      .data(parksData.features)
      .enter()
      .append("path")
      .attr("class", "park")
      .attr("d", pathGenerator);

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

const streetClassButtons = streetClassControls
      .selectAll("div.street-class-button")
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
      .text(function (d) { return d; });

const parkTypeButtons = parkTypeControls
      .selectAll("div.park-type-button")
      .data([
          "City Park",
          "Neighbourhood Park",
          "Cemetary"
      ])
      .enter()
      .append("div")
      .attr("class", "park-type-button")
      .text(function (d) { return d; });


/** ACTIONS */

function updateStreetClasses (shownClasses) {
    streets.classed("shown", function (d) {
        return _contains(shownClasses, d.properties.Class) ? true : false;
    });
    streetClassButtons.classed("shown", function (d) {
        return _contains(shownClasses, d) ? true : false;
    });
}

function updateParkTypes (shownTypes) {
    parks.classed("shown", function (d) {
        return _contains(shownTypes, d.properties.park_type) ? true : false;
    });
    parkTypeButtons.classed("shown", function (d) {
        return _contains(shownTypes, d) ? true : false;
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

    const tmpl = `<div class='court-name'>
                      <h1>${ info.name }</h1>
                  </div>
                  <div class='intersect-streets'>
                      <h2>${ intersectStreets.join(" @ ") }</h2>
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

parks.on("mouseover", function (d) {
    updateStreetNameDisplay(d.properties.Park_Name);
    highlightStreet([]);
});

streetClassButtons.on("click", function (d, _, els) {
    const shownClasses = _filterByClass(els, "shown").map(function (b) {
        return b.textContent;
    });
    const newShownClasses = _unionOrDiff(shownClasses, d);

    updateStreetClasses(newShownClasses);
});

parkTypeButtons.on("click", function (d, _, els) {
    const shownTypes = _filterByClass(els, "shown").map(function (b) {
        return b.textContent;
    });
    const newShownTypes = _unionOrDiff(shownTypes, d);

    updateParkTypes(newShownTypes);
});

ballCourts.on("mouseover", function (d) {
    streets.classed("highlighted", false);
    streetNameDisplay.text(d.properties.name);
});

ballCourts.on("click", function (d) {
    ballCourts.classed("active", false);
    select(this).classed("active", true);
    updateCourtInfoDisplay(d.properties);
});

window.addEventListener("resize", function (e) {
    const height = window.innerHeight;
    const width = window.innerWidth;

    container.style.height = windowHeight + "px";
    projection.fitExtent([[0, 0], [windowWidth * .60, windowHeight]],
                         streetData);
});


/** INITIALIZATION */

const shownStreetClasses = [ "Downtown Core",
                             "Arterial",
                             "Secondary Arterial" ];
updateStreetClasses(shownStreetClasses);

const shownParkTypes = [ "City Park" ];
updateParkTypes(shownParkTypes);

select(ballCourts.nodes()[0]).dispatch("click");
