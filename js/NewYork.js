/* Vaccination in New York City Private Schools */

function createMap(){
//initialize the map on the "map" div with a given center aand zoom level
    var map = L.map("map").setView([32.5, -80], 4);

//load and display a tile layer on the map
    var Stamen_Toner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
	       attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> and <a href="http://www.cfr.org/interactives/GH_Vaccine_Map/#introduction">Council on Foreign Relations</a>, "Vaccine-Preventable Outbreaks," 2015. Sequencer buttons courtesy of Clockwise.',
	       subdomains: 'abcd',
	       minZoom: 4,
	       maxZoom: 5,
	       ext: 'png'
    }).addTo(map);

    getData(map);
};