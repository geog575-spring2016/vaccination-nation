(function(){

keyArray=["coverage1314","pbe1314","coverage1516","pbe1516"]
var expressed=keyArray[0]


keyArray2=["measles10","measles11","measles12","measles13","measles14","measles15"]
var expressed2=keyArray2[3];



// var objectColors={
//       coverage1314:['#ca0020','#f4a582','#92c5de','#0571b0'],
//       pbe1314:[ '#ca0020','#f4a582','#92c5de','#0571b0'],
//       coverage1516:[ '#ca0020','#f4a582','#92c5de','#0571b0'],
//       pbe1516:[ '#ca0020','#f4a582','#92c5de','#0571b0']
//}

var chartWidth = 420,
    chartHeight = 397.5,
    leftPadding=29,//more room for scale
    rightPadding=20,
    topBottomPadding=20,
    chartInnerWidth=chartWidth - leftPadding - rightPadding,
    chartInnerHeight=chartHeight-(topBottomPadding*2),//make chartInnerHeight contined within padding
    translate="translate(" + leftPadding + "," + topBottomPadding + ")";

var radius = d3.scale.sqrt()



    .domain([0, 20])

    .range([0,80]);


window.onload=setMap();

function setMap(){

    var width= 650,
        height=600;

    var map=d3.select("body")
        .append("svg")
        .attr("class","map")
        .attr("width", width)
        .attr("height",height);

    var  projection = d3.geo.mercator()
			.scale(1000 * 2)
			.center([-120, 36])
			.translate([width/2, height/2]);

    var path=d3.geo.path()
        .projection(projection);

    var q=d3_queue.queue();
        q.defer(d3.csv, "data/CaliforniaData/cali_coverage.csv")//csv data
        q.defer(d3.csv, "data/CaliforniaData/cali_measles.csv") //do I load two diff sets for two diff data
        q.defer(d3.json, "data/CaliforniaData/Californ2.topojson")
        q.defer(d3.json, "data/CaliforniaData/californiapropsymbol.topojson")//spatial data
        q.await(callback);

    function callback(error, dataCoverage, dataMeasles, california, californiacenters){
        var caliCounties=topojson.feature(california, california.objects.Californ).features;
        for (var i=0; i<dataMeasles.length; i++){
          var csvCounty=dataMeasles[i];
          var csvCountyCode=csvCounty.geo_id;
          var jsonCounties=california.objects.Californ.geometries;
          for (var j=0; j<jsonCounties.length;j++){
              if(jsonCounties[j].properties.geo_id==csvCountyCode){
              for(var key in keyArray2){
                var attribute=keyArray2[key];
                var value=parseFloat(csvCounty[attribute]);
                (jsonCounties[j].properties[attribute])=value;
              }
            }
          }
        };

        var colorScale=makeColorScale(dataCoverage);
        setEnumerationUnits(caliCounties, californiacenters, map, path, colorScale);
        setChart(dataCoverage, caliCounties, colorScale);
    };
};

function makeColorScale(data){

    //for choropleth maps

    //MANUALLY SETTING SCALE, US IF STATEMENTS?
    // var color=d3.scale.threshold()
    //   //.domain([80,90,95]) //for vaccine coverage
    // //  .domain([2.82, 5.63, 13.45])//personal belief pbe1314
    //   .domain([2.22,4.44,11.92])//personal belief pbe1516
    //   //.range(['#ca0020','#f4a582','#92c5de','#0571b0'])//vaccine coverage--high=good
    //   .range(['#0571b0','#92c5de','#f4a582','#ca0020'])//personal belief--low=good
    // return color;



    //JENKS CLASSIFICATION
    // var color=d3.scale.threshold()
    //   .domain([])
    //
  // var colorClasses=objectColors[expressed];
  //
  // var colorScale=d3.scale.threshold()
  //     .range(colorClasses);
  //
  // var domainArray=[];
  // for (var i=0; i<data.length; i++){
  //   var val=parseFloat(data[i][expressed]);
  //       domainArray.push(val);
  // };
  //
  // var clusters=ss.ckmeans(domainArray, 4);
  // domainArray=clusters.map(function(d){
  //   return d3.min(d);
  // });
  //
  // domainArray.shift();
  //
  // colorScale.domain(domainArray);
  //
  // return colorScale;




  var colorScale=d3.scale.quantile()//use quantile for scale generator
         .range(['#ca0020','#f4a582','#92c5de','#0571b0']);//incorporate objectColors array to change depending on variable

//creating equal interval classifcation
 var minmax = [
       d3.min(data, function(d) { return parseFloat(d[expressed]); }),
       d3.max(data, function(d) { return parseFloat(d[expressed]); })
   ];
   //assign two-value array as scale domain
   colorScale.domain(minmax);
   return colorScale;

};




//creation of choropleth map
function choropleth(props, colorScale){
  var value = parseFloat(props[expressed]);

  if(isNaN(value)){
        return "purple";//no value
    } else if (value==0){
        return "gray";//for case of Political_Filtering with a score of 0
    } else{
        return colorScale(value);
    }
  };

function setEnumerationUnits(caliCounties, californiacenters, map, path, colorScale){
    //add countries to map
    var counties=map.selectAll(".counties")
        .data(caliCounties)
        .enter()
        .append("path")
        .attr("d",path)
        .attr("class", function(d){
            return "counties"+d.properties.geo_id;
        })
        .style("fill", "lightgrey");
        //function(d){return choropleth(d.properties,colorScale);});

    var centroids=map.selectAll(".symbol")

        .data(californiacenters.features.sort(function(a,b){return b.properties[expressed2]-a.properties[expressed];}))
      .enter().append("path")
        .attr("class","symbol")
        .attr("d",path.pointRadius(function(d){return radius(d.properties[expressed2]);}))

        .data(californiacenters.features.sort(function(a,b){return b.properties[expressed]-a.properties[expressed];}))
      .enter().append("path")
        .attr("class","symbol")
        .attr("d",path.pointRadius(function(d){return radius(d.properties[expressed]);}))
        .style({"fill": "orange",
                "fill-opacity":0.4,
                "stroke":"white"});
};


function setChart(dataMeasles, caliCounties, colorScale){

// //add chart element
//   var chart = d3.select("body")
//       .append("svg")
//       .attr("width",chartWidth)
//       .attr("height",chartHeight)
//       .attr("class","chart");
//
// //add chartBackground
//   var chartBackground = chart.append("rect")
//        .attr("class", "chartBackground")
//        .attr("width", chartInnerWidth)
//        .attr("height", chartInnerHeight)
//        .attr("transform", translate);
//
//   var yScale = d3.scale.linear()
//               //change scale values dynamically with max value of each variable
//               .domain([d3.max(dataMeasles,function(d){ return parseFloat(d[expressed])})*1.02, 0])
//               //output this between 0 and chartInnerHeight
//               .range([0, chartInnerHeight]);
//
// //bars element added
//   var bars=chart.selectAll(".bars")
//       .data(dataMeasles)
//       .enter()
//       .append("rect")
//       .sort(function(a,b){
//         //list largest values first for easier of reading
//         return b[expressed]-a[expressed];
//       })
//       .attr("class", function(d){
//         //give clas name to bars--was switching out values to see how each variable plotted out
//         return "bars " + d.coverage1314;
//       })
//       //width depending on number of elements, in my case 192-1
//       .attr("width", chartInnerWidth/dataMeasles.length - 1)
//       //determine position on x axis by number of elements, incl leftPadding
//       .attr("x", function(d,i){
//
//         return i*(chartInnerWidth/dataMeasles.length) + leftPadding;
//       })
//       //height by yscale of each value, within chartInnerHeight
//       .attr("height", function(d){
//         return chartInnerHeight-yScale(parseFloat(d[expressed]));
//       })
//       //make bars 'grow' from bottom
//       .attr("y", function(d){
//         return yScale(parseFloat(d[expressed]))+topBottomPadding;
//
//       })
//       //color by colorScale
//       .style("fill", function(d){
//         return choropleth(d, colorScale);
//       });
//
//     //   .on("mouseover", highlight)//highlight selected  bars
//     //   .on("mouseout", dehighlight)//de highlight selected bars with mouseout
//     //   .on("mousemove", moveLabel);//follow label with cursor
//     //
//     // //for returing style after an interaction
//     // var desc=bars.append("desc")
//     //     .text('{"stroke":"black", "stroke-width":"0px", "fill-opacity":"1"}');    //add chart title
//
//     //add chart title, change according to variable
//     var chartTitle=chart.append("text")
//         .attr("x", 250)
//         .attr("y", 35)
//         .attr("class","chartTitle")
//         .text([expressed])
//
//     //create vertical axis generator
//     var yAxis = d3.svg.axis()
//         .scale(yScale)
//         .orient("left");
//
//     //place axis
//     var axis = chart.append("g")
//         .attr("class", "axis")
//         .attr("transform", translate)
//         .call(yAxis);//for how actual numbers will be distributed
//
//     //create frame for chart border
//     var chartFrame = chart.append("rect")
//         .attr("class", "chartFrame")
//         .attr("width", chartInnerWidth)
//         .attr("height", chartInnerHeight)
//         .attr("transform", translate);
};



})();
