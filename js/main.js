
(function(){

  var DataArray = ["cases1993","cases1994","cases1995","cases1996","cases1997","cases1998","cases1999","cases2000","cases2001",
    "cases2002","cases2003","cases2004","cases2005","cases2006","cases2007","cases2008","cases2009","cases2010","cases2011",
    "cases2012","cases2013"];
  var expressed =DataArray[0];

  //begins script when window loads
  window.onload = setMap();

  function setMap(){

  	//map frame size. Adjusted so Map is responsive
    var width = window.innerWidth * 0.6,
      height = 400;

    //creates new svg container for the Main US Map
    var mapMain = d3.select("body")
      .append("svg")
      .attr("class", "mapMain")
      .attr("width", width)
      .attr("height", height);

    //Albers US map to fit Hawaii and Alaska below continental US
    var projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);

    //draws the spatial data as a path of stings of 'd' attributes
    var path = d3.geo.path()
      .projection(projection);

    d3_queue.queue()
      .defer(d3.csv, "data/main-outbreaks/main-outbreaks-data-noNYC.csv") //loads attributes from csv
      .defer(d3.json, "data/main-outbreaks/usStates.topojson") //loads choropleth spatial data
      .await(callback);


    function callback(error, csvData, us){
      console.log("reach callback?");
      var usStates = topojson.feature(us, us.objects.usStates).features;

      var states = mapMain.append("path")
          .datum(usStates)
          .attr("class", "states")
          .attr("d", path);
        console.log(csvData);

      usStates= joinData(usStates, csvData);
        

    };
  };

  //writes a function to join the data from the csv and geojson
  function joinData (usStates, csvData){
    console.log("reaching joinData?");
    for (var i=0; i<csvData.length; i++){
      var csvRegion = csvData[i];
      var csvKey = csvRegion.postal;
        for (var a=0; a<usStates.length; a++){
          var geojsonProps = usStates[a].properties;
          var geojsonKey = geojsonProps.postal;
            if (geojsonKey == csvKey){
              attrArray.forEach(function(attr){
                var val = parseFloat(csvRegion[attr]);
                geojsonProps[attr] = val;
              });
            };
        };
    };
    console.log("going through for statement?");
    return usStates;
  };

  function setEnumerationUnits(usStates, map, path, colorScale){ 
    var states = mapMain.selectAll(".states")
      .data(usStates)
      .enter()
      .append("path")
      .attr("class", function(d){
        return "states " + d.properties.postal;
      })
      .attr("d",path)
      .style("fill", function(d){
        return choropleth(d.properties, colorScale);
      });

      var desc=states.append("desc")
             .text('{"stroke":"white", "stroke-width":"1px"}');


      var centroids=map.selectAll(".symbol")
          .data(usCenters.features.sort(function(a,b){return b.properties[expressed2]-a.properties[expressed2];}))
        .enter().append("path")
          .attr("d",path)
          .attr("class",function(d){
              return "circle"+d.properties.postal;
          })
          .attr("d",path.pointRadius(function(d){return radius(d.properties[expressed2]);}))
          .style({"fill": "orange",
                  "fill-opacity":0.5,
                  "stroke":"black"})
        .remove();
  };


})();
