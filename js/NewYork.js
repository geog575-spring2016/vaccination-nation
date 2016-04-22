/* Vaccination in New York City Private Schools */

function createMap(){
//initialize the map on the "map" div with a given center aand zoom level
 var map = L.map("new-york-map").setView([40.7, -73.9442], 10);

//load and display a tile layer on the map
    var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	minZoom: 10,
    maxZoom: 17,
}).addTo(map);

    getData(map);
};


//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/ny/new-york-schools.geojson", {
        dataType: "json",
        success: function(response){
            
            //create a Leaflet GeoJSON layer and add to map
            L.geoJson(response).addTo(map);
//            var attributes = processData(response);
            
//            createPropSymbols(response, map, attributes);
//            createSequenceControls(map, attributes);
//            createFilterButtons(map, response);
//            createLegend(map, attributes);
//            createContextContainer(map, attributes)
        }
    });
};

$(document).ready(createMap);

