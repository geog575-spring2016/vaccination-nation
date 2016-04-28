/* Vaccination in New York City Private Schools */

//determine which attribute to visualize
var attribute = "completely-immunized";
    
var displayAttribute = "Completely Immunized";

function createMap(){
//initialize the map on the "map" div with a given center aand zoom level
    var map = L.map("new-york-map").setView([40.7, -73.98], 10);
    
//load and display a tile layer on the map
    var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    minZoom: 10,
    maxZoom: 17,
    }).addTo(map);

    getData(map);


    //restrict map boundaries    
    map.setMaxBounds([
    [40.46, -74.45],
    [40.99, -73.5]
    ]);
    
    
};

//function to convert markers to circles
function pointToLayer (feature, latlng){
    
    //for each feature, determine its value for selected attribute
    var attValue = Number(feature.properties[attribute]);
    
    //create marker options and give each circle a color based on its attValue
    var options = {
        radius: 7,
        fillColor: getColor(attValue),    
        weight: 0,
        opacity: 0.9,
        fillOpacity: 0.7
    };
    
    //create circle layer
    var layer = L.circleMarker(latlng, options);
    
    //build popup content string
    var popupContent = "<p><b>School:</b> " + feature.properties.name + "</p><p><b>" + displayAttribute + ":</b> " + feature.properties[attribute] + "%" + "</p>";
    
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    } );
    
    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
    
};

//add circle markers to the map
function colorCircles(data, map){
    //create a Leaflet GeoJSON layer and add it to the map    
    var layer = L.geoJson(data, {
        pointToLayer: pointToLayer
        }).addTo(map);
    
    //create a Leaflet Search Control plugin and add to map
    var searchControl = new L.Control.Search({
		layer: layer,
		propertyName: 'name',
		circleLocation: false,
		moveToLocation: function(latlng, title, map) {
			//map.fitBounds( latlng.layer.getBounds() );
			var zoom = map.getBoundsZoom(latlng.layer.getBounds());
  			map.setView(latlng, zoom); // access the zoom
		}
	});

	searchControl.on('search_locationfound', function(e) {
		
		e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
		if(e.layer._popup)
			e.layer.openPopup();

	}).on('search_collapsed', function(e) {

		featuresLayer.eachLayer(function(layer) {	//restore feature color
			featuresLayer.resetStyle(layer);
		});	
	});
	
	map.addControl( searchControl );  //inizialize search control

};

//create a color scale for circles
function getColor(v) {
//    console.log(v);
    if (v <= 65){
            return "#c81719";
        } else if ((v>65) && (v<=74.9)) {
//            console.log(v);
            return "#f57c24";
        } else if ((v>75) && (v<85)){
            return "#f6c452";
        } else if ((v>=85) && (v<=94.9)){
            return "#fbfb7b";
        } else {
            return "#01dd80";
        }
}

//Create filter control
function createFilterControl(map){
    
    //create a new SequenceControl Leaflet class
    var FilterControl = L.Control.extend({
        options: {
            position: "bottomleft"
        },
        
        onAdd: function(map){
            //create the control container with my control class name
            var container = L.DomUtil.create("div", "sequence-control-container");
            
            //create button elements
            $(container).append('<button type="button" class="btn all">All</button>');
            $(container).append('<button type="button" class="btn whooping">Under 65%</button>');
            $(container).append('<button type="button" class="btn measles">65% to 74.99%</button>');
            $(container).append('<button type="button" class="btn mumps">75% to 85%</button>');
            $(container).append('<button type="button" class="btn pox">85% to 94.99%</button>');
            $(container).append('<button type="button" class="btn pox">95% and over</button>');
           
            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            
            return container;
        }
    
    });
    
    map.addControl(new FilterControl());
    
};


//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/ny/new-york-schools.geojson", {
        dataType: "json",
        success: function(response){
            //call function to color circles
            colorCircles(response, map);
            createFilterControl(map);
        }
    });
};

$(document).ready(createMap);

//Pseudocode
//3. Legend
//4. Filter by worst offenders?

