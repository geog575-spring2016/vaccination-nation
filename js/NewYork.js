/* Vaccination in New York City Private Schools */

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
    
//  map.addControl( new L.Control.Search({layer: L.circleMarker}) );
    
};

//function to convert markers to circles
function pointToLayer (feature, latlng){
    //determine which attribute to visualize
    var attribute = "completely-immunized";
    
    var displayAttribute = "Completely Immunized"
    
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
    
    
//    var searchControl = new L.Control.Search({layer: L.layer , propertyName: 'name', circleLocation:false});
//searchControl.on('search_locationfound', function(e) {
//    e.layer.setStyle({fillColor: 'white', color: 'white', fillOpacity: 0.5});
//    if(e.layer._popup)
//        e.layer.openPopup();
//}).on('search_collapsed', function(e) {
//    layer.eachLayer(function(layer) {
//       layer.resetStyle(layer);
//    });
//});
//map.addControl( searchControl );
    
};

//add circle markers to the map
function colorCircles(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
//    var searchCtrl = L.control.fuseSearch()
//    searchCtrl.addTo(map);
//    
//    searchCtrl.indexFeatures(data, ['name']);
    
    
    L.geoJson(data, {
        pointToLayer: pointToLayer
        }).addTo(map);
    
      map.addControl( new L.Control.Search({sourceData: data, text:'Color...', markerLocation:true}) );
    
//    L.geoJson(data, {
//        onEachFeature: function (feature, layer) {
//        feature.layer = layer;
//            console.log(feature.layer.NewClass);
//        }
//    });
};

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
            return "#b8e186";
        }
}


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
//3. Legend
//4. Filter by worst offenders?
//5. Search?

