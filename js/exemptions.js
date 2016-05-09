(function(){

var DataArray = ["code"];
var expressed =DataArray[0];
var colorClasses = [
			"#d7191c",
			"#fdae61",
			"#ffffb2",
		];

window.onload = setMapExempt();

	function setMapExempt(){
		var width = 800;
        height = 500;
        console.log("Reach setMapExempt");
        var mapMainExempt = d3.select("#mapMainExempt")
	      	.append("svg")
	      	.attr("class", "mapMainExempt")
	      	.attr("width", width)
	      	.attr("height", height);

	    var projection = d3.geo.albersUsa()
	    	.scale(1000)
	    	.translate([width / 2, height / 2]);

	    var path = d3.geo.path()
      		.projection(projection);

      	var q = d3_queue.queue();
	      q.defer(d3.csv, "data/exemption/exemptions.csv") //loads attributes from csv
	      q.defer(d3.json, "data/exemption/usState.topojson")
	      .await(callback);

	    function callback(error, csvData, us){
	    	console.log("Reach callback");
		    var usaStates = topojson.feature(us, us.objects.usaStates).features;
		    for (var i=0; i<csvData.length; i++){
		        var csvRegion = csvData[i];
		        var csvKey = csvRegion.postal;
		        var jsonStates=us.objects.usStates.geometries;
		          	for (var a=0; a<jsonStates.length; a++){
			            if(jsonStates[a].properties.postal==csvKey){
			                for(key in DataArray){
				                var attribute=DataArray[key];
				                var value=parseFloat(csvRegion[attribute]);
			              	    (jsonStates[a].properties[attribute])=value;
			                }
			            }
		            }
		    }
		    console.log("go through for statement in callback");
		    setEnumerationUnitsExempt(usaStates, mapMainExempt, path);
    	}
	};//end of setMapExempt

	function setEnumerationUnitsExempt(usaStates, mapMainExempt, path){
		console.log("Reach setEnumerationUnitsExempt");
		var states = mapMainExempt.selectAll(".states")
			.data(usaStates)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", function(d){
				return "states " + d.properties.postal;
			})
			.style("fill", "white")
			.style("stroke", "grey");
	};




})();







