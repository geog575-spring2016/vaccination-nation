/* 575 boilerplate main.js */
(function(){
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
      .defer(d3.csv, "data/main-outbreaks/us-disease-totals-1944-2013.csv") //loads attributes from csv
      .defer(d3.json, "data/usStates.topojson") //loads choropleth spatial data
      .await(callback);

  };










})();





