//$('#mainMap').insertBefore('#new-york-map');

(function(){

  var DataArray = ["cases1993","cases1994","cases1995","cases1996","cases1997","cases1998","cases1999","cases2000","cases2001",
    "cases2002","cases2003","cases2004","cases2005","cases2006","cases2007","cases2008","cases2009","cases2010","cases2011",
    "cases2012","cases2013"];
  var attrArray = ["2009-2010", "2011-2012", "2012-2013", "2013-2014", "2014-2015"];
  var exemptionattrArray = ["codes"];

  var expressed =DataArray[0];
  var expressed2 = attrArray[0];
  var expressed3 =exemptionattrArray[0];

  var mainattributeIndex = 0

  //
  // var Exemtooltip = d3.select("#mapMainExempt").append("div")
  // 		    .attr("class", "Exemtooltip");

  var mainTitle =["Pertussis Cases","Mumps Cases","Measles Cases"];

  var radius = d3.scale.sqrt()
      .domain([0, 7195])
      .range([0,150]);


  //begins script when window loads
  window.onload = setMap();

  function setMap(){

  	//map frame size. Adjusted so Map is responsive
    var width = 800;
        height = 500;

    //creates new svg container for the Main US Map
    var mapMain = d3.select("#mainMap")
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

    var q = d3_queue.queue();
      q.defer(d3.csv, "data/vaccine_coverage/vaccine_coverage.csv")
      q.defer(d3.csv, "data/exemption/exemptions.csv") //loads attributes from csv
      q.defer(d3.json, "data/main-outbreaks/usStates.topojson")
      q.defer(d3.csv, "data/main-outbreaks/main-outbreaks-data-noNYC.csv") //loads attributes from csv
      q.defer(d3.json, "data/main-outbreaks/outbreaks-us.topojson")
       //loads choropleth spatial data
      .await(callback);

  function callback(error, csvData2, csvData3, us, csvData, usCenters){

    var usStates = topojson.feature(us, us.objects.usStates).features;
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
      for (var i=0; i<csvData3.length; i++){
	      var csvRegion = csvData3[i];
	      var csvKey = csvRegion.postal;
				var jsonStates=us.objects.usStates.geometries;
	        for (var a=0; a<jsonStates.length; a++){
							if(jsonStates[a].properties.postal==csvKey){
								for (var key in exemptionattrArray){
									var attribute=exemptionattrArray[key];
									var value=parseFloat(csvRegion[attribute]);
									(jsonStates[a].properties[attribute])=value
								}
							}
						}
					}

    var states = mapMain.append("path")
        .datum(usStates)
        .attr("class", "state_")
        .attr("d", path);

        usStates = joinData(usStates, csvData2);

        var colorScale = makeColorScale(csvData2);

        setChoroplethEnumerationUnits(usStates, mapMain, path, colorScale);

        setEnumerationUnits(usStates, usCenters, mapMain, path);
        setPropSymbols(usStates, usCenters, mapMain, path);
        propsSequenceControls();
        coverageMapLegend();
        exemptionMapLegend();
        Preventable_OutbreaksMapLegend();
    }
};


function joinData(usStates, csvData2){
   for (var i=0; i<csvData2.length; i++){
       var csvState = csvData2[i]; //the current region
       var csvKey = csvState.State; //the CSV primary key

       //loop through geojson regions to find correct region
       for (var a=0; a<usStates.length; a++){

           var geojsonProps = usStates[a].properties; //the current region geojson properties
           var geojsonKey = geojsonProps.name_1; //the geojson primary key

           //where primary keys match, transfer csv data to geojson properties object
           if (geojsonKey == csvKey){

               //assign all attributes and values
               attrArray.forEach(function(attr){
                   var val = parseFloat(csvState[attr]); //get csv attribute value
                   geojsonProps[attr] = val; //assign attribute and value to geojson properties
               });
           };
       };
     };
     return usStates;
}

  function setEnumerationUnits(usStates, usCenters, mapMain, path){
    var states = mapMain.selectAll(".states")
      .data(usStates)
      .enter()
      .append("path")
      .attr("d",path)
      .attr("class", function(d){
        return "states " + d.properties.postal;
      })
   };

   function setChoroplethEnumerationUnits(usStates, mapMain, path, colorScale){
     var states = mapMain.selectAll(".states")
       .data(usStates)
       .enter()
       .append("path")
       .attr("d",path)
       .attr("class", function(d){
         return "states " + d.properties.name_1;
       })
       .attr("d", path)
       .style("fill", function(d){
           return choropleth(d.properties, colorScale);
       })
    };

    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [
            "#d7191c",
            "#fc8d59",
            "#fadb86",
            "#47bcbf",
        ];

        //create color scale generator
        var colorScale = d3.scale.quantile()
            .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed2]);
            domainArray.push(val);
        };

        //assign array of expressed values as scale domain
        colorScale.domain(domainArray);

        return colorScale;

    };

    //function to test for data value and return color
    function choropleth(props, colorScale){
        //make sure attribute value is a number
        var val = parseFloat(props[expressed2]);
        //if attribute value exists, assign a color; otherwise assign gray
        if (val && val != 999){
            return colorScale(val);
        } else {
            return "#CCC";
        };
    };


function setPropSymbols(usStates, usCenters, mapMain, path){

    var circles=mapMain.selectAll(".circle")
      .data(usCenters.features.sort(function(a,b){return b.properties[expressed]-a.properties[expressed];}))
      .enter().append("path")
      .attr("d",path)
      .attr("class",function(d){
          return "circle circle "+d.properties.disease + " " + d.properties.postal+d.properties.disease;
      })
      .attr("d",path.pointRadius(function(d){return radius(d.properties[expressed]);}))
      .style({'fill':'white',
              'stroke':'black',
              'fill-opacity':.4,
              'display': 'none'})
      .on("mouseover", function(d){
        highlight(d.properties);
      })
      .on("mouseout", function(d){
        dehighlight(d.properties);
      })
      .on("mousemove", moveLabel);

    var desc = circles.append("desc")
      .text('{"stroke": "#000", "stroke-width": "0.5px"}');
  };

function changeAttribute(attribute, data){
      //change the expressed attribute
      expressed = attribute;
      var circles = d3.selectAll(".circles");
      updateCircles(circles, data);
}

function updateCircles(circles, data){
      var domainArray = [];
      for (var i=0; i<data.length; i++){
          var val = parseFloat(data[i][expressed]);
          domainArray.push(val);
      };
          radiusMin = Math.min.apply(Math, domainArray);
          radiusMax = Math.max.apply(Math, domainArray);

          setRadius = d3.scale.sqrt()
              .range([0, 100])
              .domain([radiusMin, radiusMax]);
      //create a second svg element to hold the bar chart
      var circleRadius= circles.attr("r", function(d){
          return setRadius(d[expressed]);
      });
};




function propsSequenceControls(){

        var mainyearLabel = d3.select("#mainyearLabel")
          .text(expressed)

          $("#mainstepForward").on("click", function(){
              mainattributeIndex +=1
                if(mainattributeIndex > DataArray.length){
                  mainattributeIndex = 0
                }

              expressed = DataArray[mainattributeIndex]

              d3.select("#mainyearLabel")
                .text(expressed)

              updateCircles(expressed, csvData)
          })

          $("#mainstepBackward").on("click", function(){
              mainattributeIndex -=1

                if(mainattributeIndex < 0){
                  mainattributeIndex = DataArray.length-1
                }

                expressed = DataArray[mainattributeIndex]

                d3.select("#mainyearLabel")
                  .text(expressed)

                updateCircles(expressed, csvData)
          })
}



        //TRYING TO FIGURE OUT HOW TO CHANGE BASED ON PATH, ONLY COLORS CIRCLES BLUE RIGH NOW

          // function(d){return assignColor(d.properties)})

        // function assignColor(circles,mapMain){
        //     var circles=mapMain.selectAll(".symbol")
        //         .data(usCenters.features.sort(function(a,b){return properties[expressed]-properties[expressed];}))
        //         .enter().append("path")
        //           .attr("d",path)
        //           .attr("class",function(d){
        //             return "circle "+properties.disease;
        //           })

        //     if("class","Mumps"){
        //         circles.style('fill','blue')

        //     }
        //     else if("class","Pertussis"){
        //         circles.style('fill','yellow')
        //     }
        //     else if("class","Measles"){
        //         circles.style('fill','orange')

        //     }

        //   };


            // .style({"fill": "orange",
            //       "fill-opacity":0.5,
            //       "stroke":"black"})

      //   function(d){
      //   return choropleth(d.properties, colorScale);
      // });

      // console.log(states);

      // var desc=states.append("desc")
      //        .text('{"stroke":"white", "stroke-width":"1px"}');



  //TRYING TO GET SYMBOLS TO HIGHLIGHT AND DEHIGHLIGHT FOR IDENTIFICATION
  function highlight(properties){
    var selected = d3.selectAll("." + properties.postal+properties.disease)
      .style({
        "stroke": "black",
        "stroke-width": "2"
    });
    setLabelMain(properties);
  };

  function dehighlight(properties){
    var selected = d3.selectAll("." + properties.postal+properties.disease)
      .style({
       "stroke": "black",
       "stroke-width": "1"
      });
    d3.select(".infolabelMain")
      .remove();
  };


  function setLabelMain(properties){
    var labelAttributeMain = "<b>"+ "Cases: "+ properties[expressed]+ "<br>" + properties.state;
    var infolabelMain = d3.select("body")
      .append("div")
      .attr({
        "class": "infolabelMain",
        "id":  properties.disease+ "_label"
      })
      .html(labelAttributeMain);
    var propNameMain = infolabelMain.append("div")
      .attr("class", "labelnameMain")
      .html("Virus: " + properties.disease);
  };

  function moveLabel(){
    var labelWidthMain = d3.select(".infolabelMain")
      .node()
      .getBoundingClientRect()
      .width;
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY + 10,
        x2 = d3.event.clientX - labelWidthMain - 10,
        y2 = d3.event.clientY +25;

    var x = d3.event.clientX > window.innerWidth - labelWidthMain - 5 ? x2 : x1;
    var y = d3.event.clientY < 5 ? y2 : y1;

    d3.select(".infolabelMain")
      .style({
          "left": x + "px",
          "top": y + "px"
      });
     };

function coverageMapLegend(){

 var boxmargin = 4,
     lineheight = 30,
     keyheight = 20,
     keywidth = 40,
     boxwidth = 4.5 * keywidth,
     formatPercent = d3.format(".0%");

 var coverageLegendcolors = ['#d7191c','#fc8d59','#fadb86','#47bcbf'];

 var title = ['United States Complete Immunizations'],
     titleheight = title.length*lineheight + boxmargin;

 var x = d3.scale.quantile()
       .domain([0,1]);

   var threshold = d3.scale.threshold()
       .domain([75,85,95,100])
       .range(coverageLegendcolors);
   var ranges = threshold.range().length;

   // return quantize thresholds for the key
   var qrange = function(max, num) {
       var a = [];
       for (var i=0; i<num; i++) {
           a.push(i*max/num);
       }
       return a;
   }

   var svg = d3.select("#coverage-legend").append("svg")
       .attr("div", "#coverage-legend")

   // make legend
   var coverageLegend = svg.append("g")
       .attr("class", "coverageLegend");

  //  coverageLegend.selectAll("text")
  //      .data(title)
  //      .enter().append("text")
  //      .attr("class", "coverage-legend-title")
  //      .attr("y", function(d, i) { return (i+1)*lineheight-2; })
  //      .text(function(d) { return d; })

  //  // make legend box
  //  var lb = coverageLegend.append("rect")
  //      .attr("transform", "translate (0,"+titleheight+")")
  //      .attr("class", "main-legend-box")
  //      .attr("width", boxwidth)
  //      .attr("height", ranges*lineheight+2*boxmargin+lineheight-keyheight);

   // make quantized key legend items
   var coverageLi = coverageLegend.append("g")
      //  .attr("transform", "translate (8,"+(titleheight+boxmargin)+")")
       .attr("class", "main-legend-items");

   coverageLi.selectAll("rect")
       .data(threshold.range().map(function(coverageLegendcolors) {
         var d = threshold.invertExtent(coverageLegendcolors);
         if (d[0] == null) d[0] = x.domain()[0];
         return d;
       }))
       .enter().append("rect")
       .attr("y", function(d, i) { return i*lineheight+lineheight-keyheight; })
       .attr("width", keywidth)
       .attr("height", keyheight)
       .style("fill", function(d) { return threshold(d[0]); });

   coverageLi.selectAll("text")
   .data(threshold.range().map(function(coverageLegendcolors) {
     var d = threshold.invertExtent(coverageLegendcolors);
     if (d[0] == null) d[0] = x.domain()[0];
     if (d[1] == null) d[1] = x.domain()[1];
     return d;
     }))
       //.data(qrange(threshold.domain()[1], ranges))
     .enter().append("text")
     .attr("x", 48)
     .attr("y", function(d, i) { return (i+1)*lineheight-2; })
     .text(function(d) { return (d[0]+" - "+d[1]+"%")})
};

function exemptionMapLegend(){

   var boxmargin = 4,
       lineheight = 30,
       keyheight = 20,
       keywidth = 40,
       boxwidth = 4.5 * keywidth,
       formatPercent = d3.format(".0%");

   var coverageLegendcolors = ['#d7191c','#fdae61','#abd9e9','#2c7bb6'];

   var title = ['State Exemptions'],
       titleheight = title.length*lineheight + boxmargin;

   var x = d3.scale.quantile()
         .domain([0,1]);

     var threshold = d3.scale.threshold()
         .domain(['personal','religious','both',100])
         .range(coverageLegendcolors);
     var ranges = threshold.range().length;

     // return quantize thresholds for the key
     var qrange = function(max, num) {
         var a = [];
         for (var i=0; i<num; i++) {
             a.push(i*max/num);
         }
         return a;
     }

     var svg = d3.select("#exemption-legend").append("svg")
         .attr("div", "#exemption-legend")

     // make legend
     var coverageLegend = svg.append("g")
         .attr("class", "coverageLegend");

    //  coverageLegend.selectAll("text")
    //      .data(title)
    //      .enter().append("text")
    //      .attr("class", "coverage-legend-title")
    //      .attr("y", function(d, i) { return (i+1)*lineheight-2; })
    //      .text(function(d) { return d; })

    //  // make legend box
    //  var lb = coverageLegend.append("rect")
    //      .attr("transform", "translate (0,"+titleheight+")")
    //      .attr("class", "main-legend-box")
    //      .attr("width", boxwidth)
    //      .attr("height", ranges*lineheight+2*boxmargin+lineheight-keyheight);

     // make quantized key legend items
     var coverageLi = coverageLegend.append("g")
        //  .attr("transform", "translate (8,"+(titleheight+boxmargin)+")")
         .attr("class", "main-legend-items");

     coverageLi.selectAll("rect")
         .data(threshold.range().map(function(coverageLegendcolors) {
           var d = threshold.invertExtent(coverageLegendcolors);
           if (d[0] == null) d[0] = x.domain()[0];
           return d;
         }))
         .enter().append("rect")
         .attr("y", function(d, i) { return i*lineheight+lineheight-keyheight; })
         .attr("width", keywidth)
         .attr("height", keyheight)
         .style("fill", function(d) { return threshold(d[0]); });

     coverageLi.selectAll("text")
     .data(threshold.range().map(function(coverageLegendcolors) {
       var d = threshold.invertExtent(coverageLegendcolors);
       if (d[0] == null) d[0] = x.domain()[0];
       if (d[1] == null) d[1] = x.domain()[1];
       return d;
       }))
         //.data(qrange(threshold.domain()[1], ranges))
       .enter().append("text")
       .attr("x", 48)
       .attr("y", function(d, i) { return (i+1)*lineheight-2; })
       .text(function(d) { return (d[0]+" - "+d[1]+"%")})
 };

function Preventable_OutbreaksMapLegend(){

  var boxmargin = 4,
      lineheight = 30,
      keyheight = 20,
      keywidth = 40,
      boxwidth = 4.5 * keywidth,
      formatPercent = d3.format(".0%");

  var coverageLegendcolors = ['#d7191c','#fc8d59','#fadb86','#47bcbf'];

  var title = ['Preventable Outbreaks'],
      titleheight = title.length*lineheight + boxmargin;

  var x = d3.scale.quantile()
        .domain([0,1]);

    var threshold = d3.scale.threshold()
        .domain([75,85,95,100])
        .range(coverageLegendcolors);
    var ranges = threshold.range().length;

    // return quantize thresholds for the key
    var qrange = function(max, num) {
        var a = [];
        for (var i=0; i<num; i++) {
            a.push(i*max/num);
        }
        return a;
    }

    var svg = d3.select("#preventable-legend").append("svg")
        .attr("div", "#preventable-legend")

    // make legend
    var coverageLegend = svg.append("g")
        .attr("class", "coverageLegend");

    // coverageLegend.selectAll("text")
    //     .data(title)
    //     .enter().append("text")
    //     .attr("class", "coverage-legend-title")
    //     .attr("y", function(d, i) { return (i+1)*lineheight-2; })
    //     .text(function(d) { return d; })

    // // make legend box
    // var lb = coverageLegend.append("rect")
    //     .attr("transform", "translate (0,"+titleheight+")")
    //     .attr("class", "main-legend-box")
    //     .attr("width", boxwidth)
    //     .attr("height", ranges*lineheight+2*boxmargin+lineheight-keyheight);

    // make quantized key legend items
    var coverageLi = coverageLegend.append("g")
        // .attr("transform", "translate (,"+(titleheight+boxmargin)+")")
        .attr("class", "main-legend-items");

    coverageLi.selectAll("rect")
        .data(threshold.range().map(function(coverageLegendcolors) {
          var d = threshold.invertExtent(coverageLegendcolors);
          if (d[0] == null) d[0] = x.domain()[0];
          return d;
        }))
        .enter().append("rect")
        .attr("y", function(d, i) { return i*lineheight+lineheight-keyheight; })
        .attr("width", keywidth)
        .attr("height", keyheight)
        .style("fill", function(d) { return threshold(d[0]); });

    coverageLi.selectAll("text")
    .data(threshold.range().map(function(coverageLegendcolors) {
      var d = threshold.invertExtent(coverageLegendcolors);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
      }))
        //.data(qrange(threshold.domain()[1], ranges))
      .enter().append("text")
      .attr("x", 48)
      .attr("y", function(d, i) { return (i+1)*lineheight-2; })
      .text(function(d) { return (d[0]+" - "+d[1]+"%")})
};


// nav tabs
$(".nav-item").hover(function(){
	$(this).toggleClass('nav-hovered')
}, function(){
	$(this).toggleClass('nav-hovered')
})

function removePropSympols(){
  d3.selectAll(".circle")
    .style("display", "none")
}

function showPropSymbols(){
  $(".circle").show()
}


$(".nav-item").click(function(){
	//control active tab css
	$(".nav-item").removeClass("active")
	$(this).addClass("active")
  var data = $(this).data('attr')
  var click = $(this).data('click')
    if (data == 'coverage'){

    }else if (data === 'preventable-outbreaks'){
      if (click){
        removePropSympols()
        var click = $(this).data('click', false)

      }
      else{
          showPropSymbols()
          var click = $(this).data('click', true)

      }
    }

	//figure out what to display
	$(".nav-panel").css({'display': "none"})
	_thisData = $(this).data('panel')
	if (_thisData == 'intro'){
		$("#intro-panel").slideToggle()
	}else if (_thisData == "intro2"){
		$("#exemption-panel").slideToggle()
	}else if (_thisData == "intro3"){
		$("#intro3-panel").slideToggle()
	}else{
		return
	}
})



   })();
