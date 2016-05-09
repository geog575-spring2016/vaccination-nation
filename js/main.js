//$('#mainMap').insertBefore('#new-york-map');

(function(){

  var DataArray = ["cases1993","cases1994","cases1995","cases1996","cases1997","cases1998","cases1999","cases2000","cases2001",
    "cases2002","cases2003","cases2004","cases2005","cases2006","cases2007","cases2008","cases2009","cases2010","cases2011",
    "cases2012","cases2013"];

  var attrArray = ["2009-2010", "2011-2012", "2012-2013", "2013-2014", "2014-2015"];

  var expressed =DataArray[0];
  var expressed2 = attrArray[0];

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
      q.defer(d3.json, "data/main-outbreaks/usStates.topojson")
      q.defer(d3.csv, "data/main-outbreaks/main-outbreaks-data-noNYC.csv") //loads attributes from csv
      q.defer(d3.json, "data/main-outbreaks/outbreaks-us.topojson")
       //loads choropleth spatial data
      .await(callback);

  function callback(error, csvData2, us, csvData, usCenters){


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

    var states = mapMain.append("path")
        .datum(usStates)
        .attr("class", "state_")
        .attr("d", path);

        usStates = joinData(usStates, csvData2);

        var colorScale = makeColorScale(csvData2);

        setChoroplethEnumerationUnits(usStates, mapMain, path, colorScale);

        setEnumerationUnits(usStates, usCenters, mapMain, path);
        setPropSymbols(usStates, usCenters, mapMain, path);
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
            "#fdae61",
            "#abd9e9",
            "#2c7bb6",
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

    var centroids=mapMain.selectAll(".symbol")
      .data(usCenters.features.sort(function(a,b){return b.properties[expressed]-a.properties[expressed];}))
      .enter().append("path")
      .attr("d",path)
      .attr("class",function(d){
          return "circle "+d.properties.disease + " " + d.properties.postal+d.properties.disease;
      })
      .attr("d",path.pointRadius(function(d){return radius(d.properties[expressed]);}))
      .style({'fill':'orange',
              'stroke':'black',
              'fill-opacity':.4})
      .on("mouseover", function(d){
      highlight(d.properties);
      })
      .on("mouseout", function(d){
      dehighlight(d.properties);
      })
      .on("mousemove", moveLabel);

    var desc = centroids.append("desc")
      .text('{"stroke": "#000", "stroke-width": "0.5px"}');
  };


        //TRYING TO FIGURE OUT HOW TO CHANGE BASED ON PATH, ONLY COLORS CIRCLES BLUE RIGH NOW

          //function(d){return assignColor(d.properties)})

        // function assignColor(centroids,mapMain){
        //     var centroids=mapMain.selectAll(".symbol")
        //         .data(usCenters.features.sort(function(a,b){return b.properties[expressed]-a.properties[expressed];}))
        //         .enter().append("path")
        //           .attr("d",path)
        //           .attr("class",function(d){
        //             return "circle "+d.properties.disease;
        //           })
        //
        //     if("class","circle Mumps"){
        //         centroids.style('fill','blue')
        //
        //     }
        //     else if("class","cirlce Pertussis"){
        //         centroids.style('fill','yellow')
        //     }
        //     else if("class","circle Measles"){
        //         centroids.style('fill','orange')
        //
        //     }
        //
        //   }

            //
            // .style({"fill": "orange",
            //       "fill-opacity":0.5,
            //       "stroke":"black"})

        //function(d){
        //return choropleth(d.properties, colorScale);
      //});

      // console.log(states);
      //
      // var desc=states.append("desc")
      //        .text('{"stroke":"white", "stroke-width":"1px"}');
      //
      //

  //TRYING TO GET SYMBOLS TO HIGHLIGHT AND DEHIGHLIGHT FOR IDENTIFICATION
  function highlight(properties){
    var selected = d3.selectAll("." + properties.postal+properties.disease)
      .style({
        "stroke": "black",
        "stroke-width": "2"
    });
    setLabel(properties);
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

  function setLabel(properties){
    var labelAttributeMain = "<b>"+ properties[expressed]+ "<br>" + properties.states;
    var infolabelMain = d3.select("body")
      .append("div")
      .attr({
        "class": "infolabelMain",
        "id": properties.disease+ "_label"
      })
      .html(labelAttributeMain);
    var propNameMain = infolabelMain.append("div")
      .attr("class", "labelnameMain")
      .html(properties.disease);
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


function createMenu(arrayX, arrayY, title, infotext, infolink){
    var yArray = [40, 85, 130, 175, 220, 265];
    var oldItems = d3.selectAll(".menuBox").remove();
    var oldItems2 = d3.selectAll(".menuInfoBox").remove();

    //creates menuBoxes
    menuBox = d3.select(".menu-inset")
            .append("svg")
            .attr("width", menuWidth)
            .attr("height", menuHeight)
            .attr("class", "menuBox");

            //creates Menu Title
    var menuTitle = menuBox.append("text")
        .attr("x", 10)
        .attr("y", 30)
        .attr("class","title")
        .text(title)
        .style("font-size", '16px');

        //draws and shades boxes for menu
        for (b = 0; b < arrayX.length; b++){
           var menuItems = menuBox.selectAll(".items")
                .data(arrayX)
                .enter()
                .append("rect")
                .attr("class", "items")
                .attr("width", 35)
                .attr("height", 35)
                .attr("x", 15);

            menuItems.data(yArray)
                .attr("y", function(d, i){
                    return d;
                });

            menuItems.data(arrayY)
                .attr("fill", function(d, i){
                    return arrayY[i];
                });
        };
        //creates menulabels
        var menuLabels = menuBox.selectAll(".menuLabels")
            .data(arrayX)
            .enter()
            .append("text")
            .attr("class", "menuLabels")
            .attr("x", 60)
            .text(function(d, i){
                for (var c = 0; c < arrayX.length; c++){
                    return arrayX[i]
                }
            })
            .style({'font-size': '14px', 'font-family': 'Open Sans, sans-serif'});

            menuLabels.data(yArray)
                .attr("y", function(d, i){
                    return d + 30;
                });

         //creates menuBoxes
        menuInfoBox = d3.select(".menu-info")
            .append("div")
            .attr("width", menuInfoWidth)
            .attr("height", menuInfoHeight)
            .attr("class", "menuInfoBox textBox")
            .html(infotext + infolink);
};



})();
