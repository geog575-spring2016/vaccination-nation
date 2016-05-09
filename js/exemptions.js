(function(){

var attrArray = ["codes"];
var expressed =attrArray[0];
var colorClasses = [
			"#d7191c",
			"#fdae61",
			"#ffffb2",
		];

var Exemtooltip = d3.select("#mapMainExempt").append("div")
		    .attr("class", "Exemtooltip");


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

	.on('mouseover', function(d){
		 Exemptooltip.style("visibility", "visible").html("<l1>"+labelTitles.pbe1516+":   "+"<b>"+d.properties.pbe1516+"%"+"</b><div>"+"County: "+"<b>"+d.properties.NAME+"</b></div></l1>");
		 highlight(d.properties)
	})
	.on('mousemove', function(){return Exemptooltip.style("top", (event.pageY-40)+"px").style("left",(event.pageX+40)+"px");})
	.on('mouseout', function(d){
			Exemptooltip.style("visibility", "hidden");
			dehighlight(d.properties)
	});

	// .on("mouseover",function(d){
	// 			 highlight(d.properties);
	// 	 })
	// 	 //on mouseout, implement dehighlight
	// 	 .on("mouseout", function(d){
	// 			 dehighlight(d.properties);
	// 	 })

}


	function makeColorScale(csvData){
		var colorScale=d3.scale.threshold()
			.domain([1,2,3])
			.range(colorClasses);
	};

	function choropleth(props, colorScale){
		var value = (props[expressed]);

		if (value == 1.00){
			return '#d7191c';
			}else if (value == 2.00){
				return "#abd9e9";
			}else if (value == 3.00){
				return "#2c7bb6"
		};

	}

	function highlight(props){
	  var selected=d3.selectAll("."+props.postal)
	      .style({
	          "stroke":"#3e3e3e",
	          "stroke-width":"3"
	      })
	  // var selectedCircles=d3.selectAll(".".props.geo_id)
	  //     .style({"stroke":"#3e3e3e",
	  //     "stroke-width":"3"})
	    // setLabel(props);
	};

	function dehighlight(props){
	   var selected=d3.selectAll("."+props.postal)
	       .style({
	         "stroke":"white",
					 "stroke-width":"1"

	      });
	  //used to determine previous style so when you mouseoff and dehighlight, it returns to that previous style
	  function getStyle(element, styleName){
	    var styleText=d3.select(element)
	        .select("desc")
	        .text();

	    var styleObject=JSON.parse(styleText);
	    return styleObject[styleName];
	  };
	};









})();
