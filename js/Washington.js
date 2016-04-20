/* Washington Map */

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    //map frame dimensions
    var width = 500,
        height = 350;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create projection for Washington State
    var projection = d3.geo.albers()
        .rotate([117, 0, 2])
        .center([-5, 47.25])
        .parallels([46, 48])
        .scale(3500)
        .translate([width / 2, height / 2])

    var path = d3.geo.path()
       .projection(projection);

    //use queue.js to parallelize asynchronous data loading
    d3_queue.queue()
        .defer(d3.csv, "data/Washington/Washington_Complete_Immunizations.csv") //load attributes from csv
        .defer(d3.csv, "data/Washington/Washington_Any_Exemption.csv") //load attributes from csv
        .defer(d3.json, "data/Washington/Washington.topojson") //load choropleth spatial data
        .await(callback);

    function callback(error, Washington_Complete_Immunizations, WashingtonData, WashingtonCounties){

        var Washington = topojson.feature(WashingtonCounties, WashingtonCounties.objects.Washington);
        Washington = Washington.features;

        //variables for data join
        var DataArray = ["2004-2005",	"2005-2006", "2006-2007",	"2007-2008",	"2008-2009",	"2009-2010",	"2010-2011",	"2011-2012",	"2012-2013",	"2013-2014",	"2014-2015", "2015-2016"];

        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<Washington_Complete_Immunizations.length; i++){
            var csvCounty = Washington_Complete_Immunizations[i]; //the current county
            var csvKey = csvCounty.Name; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a=0; a<Washington.length; a++){

                var geojsonProps = Washington[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.Name; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    DataArray.forEach(function(attr){
                        var val = parseFloat(Washington_Complete_Immunizations[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };
                console.log(Washington);
            };
        };

        //add Washington Counties to map
        var WashintonCounties = map.selectAll(".WashingtonCounties")
            .data(Washington)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "Washington " + d.properties.Name;
            })
            .attr("d", path);
    };
};
