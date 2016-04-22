/* Vaccination in New York City Private Schools */

function createMap(){
//initialize the map on the "map" div with a given center aand zoom level
 var map = L.map("new-york-map").setView([40.6782, -73.9442], 11);

//load and display a tile layer on the map
    var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

    getData(map);
};

createMap();


function getData(map){
    //load the data
    $.ajax("data/ny/new-york-schools.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = response;
            
//            createPropSymbols(response, map, attributes);
//            createSequenceControls(map, attributes);
//            createFilterButtons(map, response);
//            createLegend(map, attributes);
//            createContextContainer(map, attributes)
            console.log(attributes);

        }
    });
};

