/* Arizona Map */
(function(){

window.onload = setMap();

	function setMap(){
		//map frame size. Adjusted so Chart and map can fit next to eachother.
   		var width = window.innerWidth * 0.5,
     	height = 600;
		//create new svg container for the map
	    var map = d3.select("body")
	      .append("svg")
	      .attr("class", "map")
	      .attr("width", width)
	      .attr("height", height);
	   
   		var projection = d3.geo.albers()
     		 .scale(10000)
      		 .translate([width / 2, height / 2]);
      	//draws the spatial data as a path of stings of 'd' attributes
    	var path = d3.geo.path()
        	.projection(projection);

        //uses queue.js to parallelize asynchronous data loading
    	//these are like AJAX functions.
	    d3_queue.queue()
	      .defer(d3.csv, "data/AZ_data/AZ_County.csv") //loads attributes from csv
	      .defer(d3.json, "data/AZ_data/AZ.topojson") //loads choropleth spatial data
	      .await(callback);

		function callback(error, csvData, az){
	        var azCo = topojson.feature(az, az.objects.AZ).features;
	        
	        //add out azCo to the map
	        var state = map.append("path")
	          .datum(az)
	          .attr("class", "state")
	          .attr("d", path);

	         //azCo = joinData(azCo, csvData);
	          
      };
	};//end of set map
})();