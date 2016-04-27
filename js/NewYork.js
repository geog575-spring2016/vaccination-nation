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

function getColor(v) {
        if (21  < v < 50){
            return "FD8D3C"
        } else if (12 < v < 20) {
            return "#4cfe5a"
        } else {
            return "pink"
    
        }
}


function colorCircles(data, map){
    //create marker options
    var markerOptions = {
        radius: 7,
        fillColor: getColor(data),    
        weight: 0,
        opacity: 0.6,
        fillOpacity: 0.6
    };

    //determine which attribute to visualize
    var attribute = "completely-immunized";
    
        //create a Leaflet GeoJSON layer and add to map
        L.geoJson(data, {
            pointToLayer: function (feature, latlng){
                //for each feature, determine its value for selected attribute
                var attValue = Number(feature.properties[attribute]);
                
                getColor(attValue);
                
                console.log(feature.properties, attValue);
                
                return L.circleMarker(latlng, markerOptions);
            }
        }).addTo(map);
            
};


//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/ny/new-york-schools.geojson", {
        dataType: "json",
        success: function(response){
            //call function to color circles
            colorCircles(response, map);
        }
    });
};

$(document).ready(createMap);

//Pseudocode
//1. Retrieve tooltip/popup for circles
//2. Color scale for vaccine coverage
//3. Color circles
//4. Legend
//5. Restrict map boundaries

