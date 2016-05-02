/* 575 boilerplate main.js */
(function(){

  var attrArray = ["cases1993","cases1994","cases1995","cases1996","cases1997","cases1998","cases1999","cases2000","cases2001",
      "cases2002","cases2003","cases2004","cases2005","cases2006","cases2007","cases2008","cases2009","cases2010","cases2011",
      "cases2012","cases2013"];
  var expressed = attrArray[0];
  //begins script when window loads
  window.onload = setMap();

  function setMap(){

  	//map frame size. Adjusted so Map is responsive
    var width = window.innerWidth * 0.5,
      height = 500;

    //creates new svg container for the Main US Map
    var mapMain = d3.select("body")
      .append("svg")
      .attr("class", "mapMain")
      .attr("width", width)
      .attr("height", height);

    //Albers US map to fit Hawaii and Alaska below continental US
    var projection = d3.geo.albersUsa()
      .scale(883)
      .translate([width / 2, height / 2]);

    //draws the spatial data as a path of stings of 'd' attributes
    var path = d3.geo.path()
        .projection(projection);

    d3_queue.queue()
      .defer(d3.csv, "data/main-outbreaks/main-outbreaks-data-noNYC.csv") //loads attributes from csv
      .defer(d3.json, "data/main-outbreaks/usStates.topojson") //loads choropleth spatial data
      .await(callback);
      console.log("csvData");

    function callback(error, csvData, us){
      console.log("haha");
        var usStates = topojson.feature(us, us.objects.USAStates);
          usStates=usStates.features;
        
        //add out usStates to the map
        var states = mapMain.append("path")
          .datum(usStates)
          .attr("class", "states")
          .attr("d", path); 

        usStates = joinData(usStates, csvData);
        
      };

  };//end setMap

  //writes a function to join the data from the csv and geojson
  function joinData (usStates, csvData){
    //loops through csv to assign each set of csv attribute values to geojson
    for (var i=0; i<csvData.length; i++){
      var csvRegion = csvData[i];
      var csvKey = csvRegion.postal;
      //loops through geojson regions to find correct region
        for (var a=0; a<usStates.length; a++){
          var geojsonProps = usStates[a].properties;
          var geojsonKey = geojsonProps.postal;
          //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){
              attrArray.forEach(function(attr){
                var val = parseFloat(csvRegion[attr]); //get csv attribute value
                geojsonProps[attr] = val;
              });
            };
        };
    };
    return usStates;
  };


})();





