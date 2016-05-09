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
	      .await(callback);

	    function callback(error, csvData, us){

	    	//console.log("reach callback?");
	    	var usStates = topojson.feature(us, us.objects.usaStates).features;
	    	
	    	var states = mapMainExempt.append("path")
	    		.datum(usStates)
	    		.attr("class","states")
	    		.attr("d", path)

	    	usStates = joinData(usStates, csvData)
		    setEnumerationUnitsExempt(usStates, mapMainExempt, path);
		    var colorScale = makeColorScale(csvData);
    	}
	};//end of setMapExempt

	function joinData (usStates, csvData){
  	//console.log("reach joinData");
    for (var i=0; i<csvData.length; i++){
      var csvRegion = csvData[i];
      var csvKey = csvRegion.postal;
        for (var a=0; a<usStates.length; a++){
          var geojsonProps = usStates[a].properties;
          var geojsonKey = geojsonProps.postal;
          
            if (geojsonKey == csvKey){
              attrArray.forEach(function(attr){
                var val = parseFloat(csvRegion[attr]); 
              });
            };
        };
    };

    return usStates;
  };

	function setEnumerationUnitsExempt(usStates, mapMainExempt, path, colorScale){

		var states = mapMainExempt.selectAll(".states")
			.data(usaStates)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", function(d){
				return "states " + d.properties.postal;
			})
			.style("fill", function(d){
				return choropleth(d.properties, colorScale)
			});
	};

	function makeColorScale(csvData){
		var colorScale=d3.scale.threshold()
			.domain([1,2,3])
			.range(colorClasses);
	};

	function choropleth(props, colorScale){
		var value = (props[expressed]);
		console.log(props.codes)

		if (value == 1.00){
			return "blue";
			}else if (value == 2.00){
				return "green";
			}else if (value == 3.00){
				return "red"
		};

	}
	






})();







