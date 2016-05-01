/* Washington Map */
//wraps everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
//variables for data join
var DataArray = ["2004-2005",	"2005-2006", "2006-2007",	"2007-2008",	"2008-2009",	"2009-2010",	"2010-2011",	"2011-2012",	"2012-2013",	"2013-2014",	"2014-2015", "2015-2016"];
var expressed =DataArray[0];

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
        // .defer(d3.csv, "data/Washington/Washington_Any_Exemption.csv") //load attributes from csv
        // .defer(d3.csv, "data/Washington/Washington_Out_Of_Compliance.csv") //load attributes from csv
        .defer(d3.json, "data/Washington/Washington.topojson") //load choropleth spatial data
        .await(callback);

    function callback(error, Washington_Complete_Immunizations, Washington){

        var Washington = topojson.feature(Washington, Washington.objects.Washington);
        Washington = Washington.features;

        console.log(Washington);

        //add Washington Counties to map
        var WashingtonCounties = map.append("path")
            .datum(Washington)
            .attr("class", "WashingtonCounties")
            .attr("d", path);

        var counties = map.selectAll(".counties")
            .data(Washington)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "Washington " + d.properties.Name;
            })
            .attr("d", path);

            console.log(counties);

        //join csv data to GeoJson enumeration units
        Washington = joinData(Washington, Washington_Complete_Immunizations);

        //create the color scale
        var colorScale = makeColorScale(Washington_Complete_Immunizations);

        //add enumeration units to the map
        setEnumerationUnits(Washington, map, path, colorScale);

        createDropdown(Washington_Complete_Immunizations);
    };
};
//
function joinData(Washington, Washington_Complete_Immunizations){
    //variables for data join
    var DataArray = ["2004-2005",	"2005-2006", "2006-2007",	"2007-2008",	"2008-2009",	"2009-2010",	"2010-2011",	"2011-2012",	"2012-2013",	"2013-2014",	"2014-2015", "2015-2016"];

    //loop through csv to assign each set of csv attribute values to geojson counties
    for (var i=0; i<Washington_Complete_Immunizations.length; i++){
      var csvCounty = Washington_Complete_Immunizations[i]; //the current county
      var csvKey = csvCounty.Name; //the CSV primary key

      //loop through geojson regions to find correct counties
      for (var a=0; a<Washington.length; a++){

          var geojsonProps = Washington[a].properties; //the current region geojson properties
          var geojsonKey = geojsonProps.Name; //the geojson primary key

          //where primary keys match, transfer csv data to geojson properties object
          if (geojsonKey == csvKey){
              //assign all attributes and values
              DataArray.forEach(function(attr){
                  var val = parseFloat(csvCounty[attr]); //get csv attribute value
                  geojsonProps[attr] = val; //assign attribute and value to geojson properties
              });
          };
      };
    };
    return Washington;
};

function setEnumerationUnits(Washington, map, path, colorScale){
  //add Washington Counties to map
  var WashingtonCounties = map.selectAll(".WashingtonCounties")
      .data(Washington)
      .enter()
      .append("path")
      .attr("class", function(d){
          return "Washington " + d.properties.Name;
      })
      .attr("d", path)
      .style("fill", function(d){
          return colorScale(d.properties[expressed]);
      });
};

//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scale.quantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
};

//function to create a dropdown menu for attribute selection
function createDropdown(Washington_Complete_Immunizations){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, Washington_Complete_Immunizations)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(DataArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
};

//dropdown change listener handler
function changeAttribute(attribute, Washington_Complete_Immunizations){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(Washington_Complete_Immunizations);

    //recolor enumeration units
    var counties = d3.selectAll(".counties")
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });
};

})();
