/* Vaccination in New York City Private Schools */

function createMap(){
//initialize the map on the "map" div with a given center aand zoom level
 var map = L.map("map").setView([40.8, -74], 12);

//load and display a tile layer on the map
    var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

    getData(map);
};

createMap();

