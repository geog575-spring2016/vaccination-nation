(function(){

var attrArray = ["codes"];
var expressed =attrArray[0];
var colorClasses = [
			"#d7191c",
			"#fdae61",
			"#ffffb2",
		];


window.onload = setMapExempt();

	function setMapExempt(){
		var width = 800;
        height = 500;
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
	      q.await(callback);

	    function callback(error, csvData, us){

	    	//console.log("reach callback?");
	    	var usStates = topojson.feature(us, us.objects.usaStates).features;
				for (var i=0; i<csvData.length; i++){
		      var csvRegion = csvData[i];
		      var csvKey = csvRegion.postal;
					var jsonStates=us.objects.usaStates.geometries;
		        for (var a=0; a<usStates.length; a++){
								if(jsonStates[a].properties.postal==csvKey){
									for (var key in attrArray){
										var attribute=attrArray[key];
										var value=parseFloat(csvRegion[attribute]);
										(jsonStates[a].properties[attribute])=value
									}
								}
							}
						}
						setEnumerationUnitsExempt(usStates,mapMainExempt,path )

					}

}

function setEnumerationUnitsExempt(usStates, mapMainExempt, path){

	var states = mapMainExempt.selectAll(".states")
		.data(usStates)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", function(d){
			return "states " + d.properties.postal;
		})
		.style("fill",
		function(d){	return choropleth(d.properties);

		})
	.style("stroke", "white")

}


	function makeColorScale(csvData){
		var colorScale=d3.scale.threshold()
			.domain([1,2,3])
			.range(colorClasses);
	};

	function choropleth(props, colorScale){
		var value = (props[expressed]);

		if (value == 1.00){
			return "blue";
			}else if (value == 2.00){
				return "green";
			}else if (value == 3.00){
				return "red"
		};

	}







})();
