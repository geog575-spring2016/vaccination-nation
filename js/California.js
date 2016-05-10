
(function(){

keyArray=["coverage1314","pbe1314","coverage1516","pbe1516"]
var expressed=keyArray[0]

keyArray2=["measles10","measles11","measles12","measles13","measles14"]
var expressed2=keyArray2[0];

var attributeIndex = 0

var labelTitles={
    coverage1314:['Vaccination Coverage Rate 2013-2014'],
    pbe1314:['Personal Belief Exemption Rate 2013-2014'],
    coverage1516:['Vaccination Coverage Rate 2015-2016'],
    pbe1516:['Personal Belief Exemption Rate 2015-2016'],
}

var labelTitles2={
    measles10:['Number of Measles Outbreaks in 2010'],
    measles11:['Number of Measles Outbreaks in 2011'],
    measles12:['Number of Measles Outbreaks in 2012'],
    measles13:['Number of Measles Outbreaks in 2013'],
    measles14:['Number of Measles Outbreaks in 2014']
}



var legendLables={

}

var colorScaleVC=d3.scale.threshold()
    .domain([80,90,95])
    .range(['#d7191c','#fdae61','#abd9e9','#2c7bb6']);

var colorScalepb13=d3.scale.quantile()
    .domain([0,21.26])
    .range(['#2c7bb6','#abd9e9','#fdae61','#d7191c']);

var colorScalepb14=d3.scale.quantile()
    .domain([0,21.26])
    .range(['#2c7bb6','#abd9e9','#fdae61','#d7191c']);

var width = 1200,
    height = 500,
    formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

var radius = d3.scale.sqrt()
    .domain([0, 20])
    .range([0,80]);


var tooltip = d3.select("#california-map").append("div")
    .attr("class", "CAtoolTip");

window.onload=setmap();

function setmap(){

    var width= 500,
        height = 550;

    var CAmap=d3.select("#california-map")
        .append("svg")
        .attr("class","CAmap")
        .attr("width", width)
        .attr("height",height);

    var  projection = d3.geo.mercator()
			.scale(1120 * 2)
			.center([-119.5, 37])
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
          var csvCountyCode=csvCounty.adm;
          var jsonCounties=california.objects.Californ.geometries;
          for (var j=0; j<jsonCounties.length;j++){
              if(jsonCounties[j].properties.adm==csvCountyCode){
              for(var key in keyArray2){
                var attribute=keyArray2[key];
                var value=parseFloat(csvCounty[attribute]);
                (jsonCounties[j].properties[attribute])=value;
              }
            }
          }
        };

        for (var i=0; i<dataCoverage.length; i++){
          var csvCounty=dataCoverage[i];
          var csvCountyCode=csvCounty.adm;
          var jsonCounties=california.objects.Californ.geometries;
          for (var j=0; j<jsonCounties.length;j++){
              if(jsonCounties[j].properties.adm==csvCountyCode){
              for(var key in keyArray){
                var attribute=keyArray[key];
                var value=parseFloat(csvCounty[attribute]);
                (jsonCounties[j].properties[attribute])=value;

              }
            }
          }
        }
        addVCLegend();
        addPBELegend();
        //var colorScale=makeColorScale(dataCoverage);
        setEnumerationUnits(caliCounties, californiacenters, CAmap, path);
        selectLayer(caliCounties, californiacenters, dataMeasles, CAmap, path);
      //  CAchangeAttribute(expressed2, CAmap, path)
      //  var radiusScale=setRadius(californiacenters);
        //CAcreateSequenceControls(caliCounties, californiacenters, properties, dataMeasles, CAmap, path)
        //CAcreateSequenceControls(properties)
        //setSliderBar(caliCounties,CAmap,path);

        //setChart(dataCoverage, caliCounties, colorScale);
    }

};

function setEnumerationUnits(caliCounties, californiacenters, CAmap, path){
    //add countries to CAmap
    var counties=CAmap.selectAll(".counties")
        .data(caliCounties)
        .enter()
        .append("path")
        .attr("d",path)
        .attr("class", function(d){

            return "counties "+d.properties.adm;
        })
        .style({"fill":"#f2f2f1",
                "stroke": "#b1babb",
                "stroke-width":1})
            //function(d){return choropleth(d.properties,colorScale);})
      //  .on("mousemove", moveLabel)
        //on mouseover implement highight
      //   .on("mouseover",function(d){
      //       highlight(d.properties)
      //  })
      // //on mouseout, implement dehighlight
      //   .on("mouseout", function(d){
      //     dehighlight(d.properties);
      // });

    var desc=counties.append("desc")
             .text('{"stroke":"#aab4b5", "stroke-width":"1px"}');


   var centroids=CAmap.selectAll(".symbol14")
       .data(californiacenters.features.sort(function(a,b){return b.properties.measles14-a.properties.measles14;}))
     .enter().append("path")
       .attr("class", function(d){

             return "circle14 "+d.properties.county+ d.properties.geo_id;
       })

       .attr("d",path.pointRadius(function(d){return radius(d.properties.measles14);}))
       .style({"fill": "orange",
               "fill-opacity":0.5,
               "stroke":"black"})
     .on("mouseover", function(d){
             tooltip.style("visibility", "visible").html("<l1>"+labelTitles2.measles14+":   "+"<b>"+d.properties.measles14+"</b><div>"+"County: "+"<b>"+d.properties.county+"</b></div></l1>");
             highlightCircles(d.properties)
     })
     .on("mousemove", function(){return tooltip.style("top", (event.pageY-50)+"px").style("left",(event.pageX+50)+"px");})
     .on("mouseout", function(d){
           tooltip.style("visibility", "hidden");
           dehighlightCircles(d.properties)

         });
    //   .remove();
};

function addVCLegend(){

  var boxmargin = 4,
      lineheight = 30,
      keyheight = 20,
      keywidth = 40,
      boxwidth = 3.5 * keywidth,
      formatPercent = d3.format(".0%");

//  var margin = { "left": 160, "top": 80 };

  var legendcolors = ['#d7191c','#fdae61','#abd9e9','#2c7bb6'];

  var title = ['Coverage Rates'],
      titleheight = title.length*lineheight + boxmargin;

  var x = d3.scale.quantile()
        .domain([0,1]);

    var threshold = d3.scale.threshold()
        .domain([80,90,95,100])
        .range(legendcolors);
    var ranges = threshold.range().length;

    // return quantize thresholds for the key
    var qrange = function(max, num) {
        var a = [];
        for (var i=0; i<num; i++) {
            a.push(i*max/num);
        }
        return a;
    }

    var svg = d3.select("#california-legend-vc").append("svg")
        .attr("class", "VClegendContainer");
        //.attr("width", width)
      //  .attr("height", height)
        //.remove();

    // make legend
    var legend = svg.append("g")
//        .attr("transform", "translate ("+margin.left+","+margin.top+")")
        .attr("class", "legend");


    //     var legendContainer = d3.select("#california-legend-vc")
//        .append("svg")
//        .attr("class", "legendContainer");
//
//    var legend = svg.append("g")
//        .attr("transform", "translate ("+margin.left+","+margin.top+")")
//        .attr("class", "legend");

    legend.selectAll("text")
        .data(title)
        .enter().append("text")
        .attr("class", "CAlegend-title")
        .attr("y", function(d, i) { return (i+1)*lineheight-2; })
        .text(function(d) { return d; })

    // make legend box
    var lb = legend.append("rect")
        .attr("transform", "translate (0,"+titleheight+")")
        .attr("class", "CAlegend-box")
        .attr("width", boxwidth)
        .attr("height", ranges*lineheight+2*boxmargin+lineheight-keyheight);

    // make quantized key legend items
    var li = legend.append("g")
        .attr("transform", "translate (8,"+(titleheight+boxmargin)+")")
        .attr("class", "CAlegend-items");

    li.selectAll("rect")
        .data(threshold.range().map(function(legendcolors) {
          var d = threshold.invertExtent(legendcolors);
          if (d[0] == null) d[0] = x.domain()[0];
          //console.log(d);
          //console.log(d[0]+" - "+d[1]+"%");
          //if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
        .enter().append("rect")
        .attr("y", function(d, i) { return i*lineheight+lineheight-keyheight; })
        .attr("width", keywidth)
        .attr("height", keyheight)
        .style("fill", function(d) { return threshold(d[0]); });

    li.selectAll("text")
    .data(threshold.range().map(function(legendcolors) {
      var d = threshold.invertExtent(legendcolors);
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

function addPBELegend(){


  var boxmargin = 4,
      lineheight = 30,
      keyheight = 20,
      keywidth = 40,
      boxwidth = 4.5 * keywidth,
      formatPercent = d3.format(".0%");

//  var margin = { "left": 160, "top": 80 };

  var legendcolors = ['#2c7bb6','#abd9e9','#fdae61','#d7191c'];

  var title = ['Personal Belief Exemptions'],
      titleheight = title.length*lineheight + boxmargin;

  var x = d3.scale.quantile()
        .domain([0,1]);

    var quantile = d3.scale.quantile()
        .domain([0,21.26])
        .range(legendcolors);
    var ranges = quantile.range().length;

    // return quantize thresholds for the key
    var qrange = function(max, num) {
        var a = [];
        for (var i=0; i<num; i++) {
            a.push(i*max/num);
        }
        return a;
    }

    var svg = d3.select("#california-legend-vc")
        .append("svg")
        .attr("class", "PBElegendContainer");


        //.attr("width", 138)
        //.attr("height", 140)
        //.remove();

    // make legend
    var legend = svg.append("g")
//        .attr("transform", "translate ("+margin.left+","+margin.top+")")
        .attr("class", "legend");

    legend.selectAll("text")
        .data(title)
        .enter().append("text")
        .attr("class", "CAlegend-title")
        .attr("y", function(d, i) { return (i+1)*lineheight-2; })
        .text(function(d) { return d; })

    // make legend box
    var lb = legend.append("rect")
        .attr("transform", "translate (0,"+titleheight+")")
        .attr("class", "CAlegend-box")
        .attr("width", boxwidth)
        .attr("height", ranges*lineheight+2*boxmargin+lineheight-keyheight);

    // make quantized key legend items
    var li = legend.append("g")
        .attr("transform", "translate (8,"+(titleheight+boxmargin)+")")
        .attr("class", "CAlegend-items");

    li.selectAll("rect")
        .data(quantile.range().map(function(legendcolors) {
          var d = quantile.invertExtent(legendcolors);
          if (d[0] == null) d[0] = x.domain()[0];
          //console.log(d);
          //console.log(d[0]+" - "+d[1]+"%");
          //if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
        .enter().append("rect")
        .attr("y", function(d, i) { return i*lineheight+lineheight-keyheight; })
        .attr("width", keywidth)
        .attr("height", keyheight)
        .style("fill", function(d) { return quantile(d[0]); });

    li.selectAll("text")
    .data(quantile.range().map(function(legendcolors) {
      var d = quantile.invertExtent(legendcolors);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
      }))
        //.data(qrange(threshold.domain()[1], ranges))
        .enter().append("text")
        .attr("x", 48)
        .attr("y", function(d, i) { return (i+1)*lineheight-2; })
        .text(function(d) { return d[0]+" - "+d[1]+"%"})


};


function highlight(props){
  var selected=d3.selectAll("."+props.adm)
      .style({
          "stroke":"#3e3e3e",
          "stroke-width":"3"
      })
  // var selectedCircles=d3.selectAll(".".props.geo_id)
  //     .style({"stroke":"#3e3e3e",
  //     "stroke-width":"3"})
    // setLabel(props);
};

function highlightCircles(properties){
  var selected=d3.selectAll("."+properties.county+ properties.geo_id)
      .style({
          "stroke":"#3e3e3e",
          "stroke-width":"3"
      })
};

function dehighlightCircles(properties){
  var selected=d3.selectAll("."+properties.county+ properties.geo_id)
      .style({
        "stroke":"black",
        "stroke-width":"1"
      });

}



function dehighlight(props){
   var selected=d3.selectAll("."+props.adm)
       .style({
         "stroke":"white",
        //  function(){
        //       return getStyle(this, "stroke")
        // },
         "stroke-width":function(){
              return getStyle(this, "stroke-width")
         }
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


function selectLayer(caliCounties, californiacenters, dataMeasles, CAmap, path){

  d3.selectAll('.radio').on('change', function(){

     if(document.getElementById('propsymbs14').checked) {
//          d3.select("#california-legend-vc").remove();
//          d3.select("#california-legend-pbe").remove();
      CAmap.selectAll('.circle13').remove();
      d3.selectAll('.counties').transition().duration(200)
        .style({'fill': "#f2f2f1","stroke":"#aab4b5","stroke-width":1})

      var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
                .on('mouseover', function(d){return tooltip.style("visibility", "hidden")})
                .on('mouseout', function(){return tooltip.style("visibility", "hidden");});


      var centroids=CAmap.selectAll(".symbol14")
          .data(californiacenters.features.sort(function(a,b){return b.properties.measles14-a.properties.measles14;}))
        .enter().append("path")
          .attr("class", function(d){

                return "circle14 "+d.properties.county+ d.properties.geo_id;
          })

          .attr("d",path.pointRadius(function(d){return radius(d.properties.measles14);}))
          .style({"fill": "orange",
                  "fill-opacity":0.5,
                  "stroke":"black"})
        .on("mouseover", function(d){
                tooltip.style("visibility", "visible").html("<l1>"+labelTitles2.measles14+":   "+"<b>"+d.properties.measles14+"</b><div>"+"County: "+"<b>"+d.properties.county+"</b></div></l1>");
                highlightCircles(d.properties)
        })
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-50)+"px").style("left",(event.pageX+50)+"px");})
        .on("mouseout", function(d){
              tooltip.style("visibility", "hidden");
              dehighlightCircles(d.properties)

            });
        }

//        if (document.getElementById('none').checked) {
//
//               CAmap.selectAll('.circle13').remove();
//               CAmap.selectAll('.circle14').remove();
// //              d3.select("#california-legend-vc").remove();
// //              d3.select("#california-legend-pbe").remove();
//
//               d3.selectAll('.counties').transition().duration(200)
//                     .style({'fill':'#f2f2f1',
//                             'stroke':'#aab4b5',
//                             'stroke-width': "1px"});
//               var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
//                         .on('mouseover', function(){ tooltip.style("visibility", "hidden")})
//                         .on('mouseout', function(){return tooltip.style("visibility", "hidden");})
//
//       }
        if (document.getElementById('vc13').checked) {
               // addVCLegend();
//                d3.select("california-legend-pbe").remove()
                CAmap.selectAll('.circle13').remove();
                CAmap.selectAll('.circle14').remove();
                var counites=d3.selectAll('.counties').transition().duration(200)
                    .style('fill', function(d){return colorScaleVC(d.properties.coverage1314)})
                    .style('stroke','white')

                var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
                    .on('mouseover', function(d){
                      tooltip.style("visibility", "visible").html("<l1>"+labelTitles.coverage1314+":   "+"<b>"+d.properties.coverage1314+"%"+"</b><div>"+"County: "+"<b>"+d.properties.NAME+"</b></div></l1>")
                      highlight(d.properties)
                    })
                  	.on('mousemove', function(){tooltip.style("top", (event.pageY-40)+"px").style("left",(event.pageX+40)+"px");})
                  	.on('mouseout', function(d){
                        tooltip.style("visibility", "hidden");
                        dehighlight(d.properties)
                    })

      }


       else if (document.getElementById('pb13').checked) {
                 // addPBELegend();
                //  d3.select("#california-legend-vc").remove();
                  CAmap.selectAll('.circle13').remove();
                  CAmap.selectAll('.circle14').remove();
                  d3.selectAll('.counties').transition().duration(200)
                    .style('fill', function(d){return colorScalepb13(d.properties.pbe1314)})
                    .style('stroke','white')
                  var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
                            .on('mouseover', function(d){
                                tooltip.style("visibility", "visible").html("<l1>"+labelTitles.pbe1314+":   "+"<b>"+d.properties.pbe1314+"%"+"</b><div>"+"County: "+"<b>"+d.properties.NAME+"</b></div></l1>");
                                highlight(d.properties)
                            })
                          	.on('mousemove', function(){return tooltip.style("top", (event.pageY-40)+"px").style("left",(event.pageX+40)+"px");})
                          	.on('mouseout', function(d){
                                tooltip.style("visibility", "hidden");
                                dehighlight(d.properties)
                            });
      }

       else if (document.getElementById('vc15').checked) {
//                  d3.select("california-legend-pbe").remove()
                //  addVCLegend();
                  CAmap.selectAll('.circle13').remove();
                  CAmap.selectAll('.circle14').remove();
                  d3.selectAll('.counties').transition().duration(200)
                    .style('fill', function(d){return colorScaleVC(d.properties.coverage1516)})
                    .style('stroke','white');
                  var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
                            .on('mouseover', function(d){
                                tooltip.style("visibility", "visible").html("<l1>"+labelTitles.coverage1516+":   "+"<b>"+d.properties.coverage1516+"%"+"</b><div>"+"County: "+"<b>"+d.properties.NAME+"</b></div></l1>");
                                highlight(d.properties)
                            })
                            .on('mousemove', function(){return tooltip.style("top", (event.pageY-40)+"px").style("left",(event.pageX+40)+"px");})
                            .on('mouseout', function(d){
                                tooltip.style("visibility", "hidden");
                                dehighlight(d.properties)
                            });
            //      CAcreateSequenceControls()
      }

       else if (document.getElementById('pb15').checked) {
                 // addPBELegend();
//                  d3.select("#california-legend-vc").remove();
                  CAmap.selectAll('.circle13').remove();
                  CAmap.selectAll('.circle14').remove();
                  d3.selectAll('.counties').transition().duration(200)
                    .style('fill', function(d){return colorScalepb14(d.properties.pbe1516)})
                    .style('stroke','white');
                  var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
                            .on('mouseover', function(d){
                               tooltip.style("visibility", "visible").html("<l1>"+labelTitles.pbe1516+":   "+"<b>"+d.properties.pbe1516+"%"+"</b><div>"+"County: "+"<b>"+d.properties.NAME+"</b></div></l1>");
                               highlight(d.properties)
                            })
                            .on('mousemove', function(){return tooltip.style("top", (event.pageY-40)+"px").style("left",(event.pageX+40)+"px");})
                            .on('mouseout', function(d){
                                tooltip.style("visibility", "hidden");
                                dehighlight(d.properties)
                            });
                //  CAcreateSequenceControls()

      }

      else if(document.getElementById('propsymbs13').checked) {
//        d3.select("#california-legend-vc").remove();
//        d3.select("#california-legend-pbe").remove();
        CAmap.selectAll('.circle14').remove();
        d3.selectAll('.counties').transition().duration(200)
          .style({'fill': "#f2f2f1","stroke":"#aab4b5","stroke-width":1})

        var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
                  .on('mouseover', function(d){return tooltip.style("visibility", "hidden")})
                  .on('mouseout', function(){return tooltip.style("visibility", "hidden");});


        var centroids=CAmap.selectAll(".symbol13")
            .data(californiacenters.features.sort(function(a,b){return b.properties.measles13-a.properties.measles13;}))
            .enter().append("path")
            .attr("class", function(d){

                  return "circle13 "+d.properties.county+ d.properties.geo_id;
            })
            .attr("d",path.pointRadius(function(d){return radius(d.properties.measles13);}))
            .style({"fill": "orange",
                    "fill-opacity":0.5,
                    "stroke":"black"})
          .on("mouseover", function(d){
                  tooltip.style("visibility", "visible").html("<l1>"+labelTitles2.measles13+":   "+"<b>"+d.properties.measles13+"</b><div>"+"County: "+"<b>"+d.properties.county+"</b></div></l1>");
                  highlightCircles(d.properties)
          })
        	.on("mousemove", function(){return tooltip.style("top", (event.pageY-50)+"px").style("left",(event.pageX+50)+"px");})
        	.on("mouseout", function(d){
                tooltip.style("visibility", "hidden");
                dehighlightCircles(d.properties)

              });
        }

//         else if(document.getElementById('propsymbs14').checked) {
// //          d3.select("#california-legend-vc").remove();
// //          d3.select("#california-legend-pbe").remove();
//           CAmap.selectAll('.circle13').remove();
//           d3.selectAll('.counties').transition().duration(200)
//             .style({'fill': "#f2f2f1","stroke":"#aab4b5","stroke-width":1})
//
//           var singleCounties=CAmap.selectAll(".counties").data(caliCounties)
//                     .on('mouseover', function(d){return tooltip.style("visibility", "hidden")})
//                     .on('mouseout', function(){return tooltip.style("visibility", "hidden");});
//
//
//           var centroids=CAmap.selectAll(".symbol14")
//               .data(californiacenters.features.sort(function(a,b){return b.properties.measles14-a.properties.measles14;}))
//             .enter().append("path")
//               .attr("class", function(d){
//
//                     return "circle14 "+d.properties.county+ d.properties.geo_id;
//               })
//
//               .attr("d",path.pointRadius(function(d){return radius(d.properties.measles14);}))
//               .style({"fill": "orange",
//                       "fill-opacity":0.5,
//                       "stroke":"black"})
//             .on("mouseover", function(d){
//                     tooltip.style("visibility", "visible").html("<l1>"+labelTitles2.measles14+":   "+"<b>"+d.properties.measles14+"</b><div>"+"County: "+"<b>"+d.properties.county+"</b></div></l1>");
//                     highlightCircles(d.properties)
//             })
//             .on("mousemove", function(){return tooltip.style("top", (event.pageY-50)+"px").style("left",(event.pageX+50)+"px");})
//             .on("mouseout", function(d){
//                   tooltip.style("visibility", "hidden");
//                   dehighlightCircles(d.properties)
//
//                 });
//             }
        })
      };

})();

// var legend = d3.select('#legend')
//   .append('ul')
//     .attr('class', 'list-inline');
//
// var keys = legend.selectAll('li.key')
//     .data(colorScaleVC.range());
//
// keys.enter().append('li')
//     .attr('class', 'key')
//     .style('border-top-color', String)
//     .text(function(d) {
//         var r = colorScaleVC.invertExtent(d);
//         return formats.percent(r[0]);
//     });
//}



// function CAchangeAttribute(expressed2, CAmap, path){
//
//
//     //var radiusScale=setRadius(californiacenters);
//
//     //recolor enumeration units
//     var centroids=CAmap.selectAll(".symbol")
//       //.data(californiacenters.features.sort(function(a,b){return b.properties[expressed2]-a.properties[expressed2];}))
//       //.enter().append("path")
//       .attr("class", function(d){
//               return "circle "+d.properties.county +d.properties.geo_id;
//         })
//         .attr("d",path.pointRadius(function(d){return radius(d.properties[expressed2]);}))
//         //.style("fill","blue")
//       // .data(californiacenters.features.sort(function(a,b){return b.properties[expressed2]-a.properties[expressed2];}))
//       // .enter().append("path")
//       // .attr("class", function(d){
//       //         return "circle "+d.properties.county +d.properties.geo_id;
//       //   })
//     //    .attr("d",path.pointRadius(function(d){return radiusScale(d.properties[expressed2]);}))
//       //   .style({"fill": "orange",
//       //           "fill-opacity":0.5,
//       //           "stroke":"black"})
//       // .on("mouseover", function(d){
//       //         tooltip.style("visibility", "visible").html("<l1>"+labelTitles2[expressed2]+":   "+"<b>"+d.properties[expressed2]+" cases"+"</b><div>"+"County: "+"<b>"+d.properties.county+"</b></div></l1>");
//       //         highlightCircles(d.properties)
//       // })
//       // .on("mousemove", function(){return tooltip.style("top", (event.pageY-50)+"px").style("left",(event.pageX+50)+"px");})
//       // .on("mouseout", function(d){
//       //       tooltip.style("visibility", "hidden");
//       //       dehighlightCircles(d.properties)
//       // });
//
//   // .style({"fill": "orange",
//         //         "fill-opacity":0.5,
//         //         "stroke":"black"
//         // });
// };

// function CAcreateSequenceControls(caliCounties, californiacenters, properties, dataMeasles, CAmap, path){
//
//       var yearLabel = d3.select("#CAyearLabel")
//         .text(sequencerTitles[expressed2])
//
//         $("#CAstepForward").on("click", function(){
//             attributeIndex +=1
//               if(attributeIndex > keyArray2.length){
//                 attributeIndex = 0
//               }
//
//             expressed2 = keyArray2[attributeIndex]
//
//             d3.select("#CAyearLabel")
//               .text(sequencerTitles[expressed2])
//
//
//
//             //CAchangeAttribute(expressed2, CAmap, path)
//         })
//
//         $("#CAstepBackward").on("click", function(){
//             attributeIndex -=1
//
//               if(attributeIndex < 0){
//                 attributeIndex = keyArray2.length-1
//               }
//
//               expressed2 = keyArray2[attributeIndex]
//
//               d3.select("#CAyearLabel")
//                 .text(sequencerTitles[expressed2])
//
//           //  CAchangeAttribute(expressed2, CAmap, path)
//         })
// }


// function setLabel(props){
//
//   var labelAttribute="<h1>"+labelTitles[expressed]+"<b>"+":   "+props[expressed]+"</b></h><h2>";
//   var infoLabel=d3.select("body")
//         .append("div")
//         .attr({
//             "class": "infoLabel",
//             "id":"."+props.adm
//         })
//         .html(labelAttribute);
//
//     var countyName=infoLabel.append("body")
//         .attr("class","labelname")
//         .html(props.county);
//
//
// };
//
// //to move label
// function moveLabel(){
// //get label dimensions to determining positioning when mousing over
//  var labelWidth=d3.select(".infoLabel")
//     .node()
//     .getBoundingClientRect()
//     .width;
// //give to possible positions depending on position of mouse, distance to border
// var x1=d3.event.clientX,
//     y1=d3.event.clientY-75,
//     x2=d3.event.clientX-labelWidth,
//     y2=d3.event.clientY+25;
//
//     var x = d3.event.clientX > window.innerWidth - labelWidth - 10 ? x2 : x1;
//     //vertical label coordinate, testing for overflow
//     var y = d3.event.clientY < 75 ? y2 : y1;
//   d3.select(".infoLabel")
//       .style({
//         "left":x+"px",
//         "top": y + "px"
//       });
// };


// function CAchangeAttributes(attribute, attribute2, dataMeasles, dataCoverage){
//   expressed=attribute;
//   expressed2=attribute2;
//   var labelAttribute="<h1>"+labelTitles[expressed]+"<b>"+":   "+props[expressed]+"</b></h><h2>";
//   var infoLabel=d3.select("body")
//         .append("div")
//         .attr({
//             "class": "infoLabel",
//             "id":"."+props.adm
//         })
//         .html(labelAttribute);
//
//     var countyName=infoLabel.append("body")
//         .attr("class","labelname")
//         .html(props.name);
//
//
// }



//function setChart(dataMeasles, caliCounties, CAmap,path, colorScale){

// //add chart element
//   var chart = d3.select("body")
//       .append("svg")
//       .attr("width",chartWidth)
//       .attr("height",chartHeight)
//       .attr("class","CAchart");
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

// function makeColorScale(data){
//
//     var colorScaleVC=d3.scale.threshold()
//         .domain([80,90,95])
//         .range(['#ca0020','#f4a582','#92c5de','#0571b0'])
//         return colorScaleVC;
//
//     var colorScalepb13=d3.scale.threshold()
//         .domain([2.82, 5.63, 13.45])
//         .range(['#0571b0','#92c5de','#f4a582','#ca0020']);
//         return colorScalepb13;
//
//     var colrScalepb15=d3.scale.threshold()
//         .domain([2.22,4.44,11.92])
//         .range(['#0571b0','#92c5de','#f4a582','#ca0020']);
//         return colorScalepb15;
//
//
//     // //for choropleth CAmaps
//     //
//     // //MANUALLY SETTING SCALE, US IF STATEMENTS?
//     // var color=d3.scale.threshold()
//     // //  .domain([2.82, 5.63, 13.45])//personal belief pbe1314
//     // //  .domain([2.22,4.44,11.92])//personal belief pbe1516
//     //   //.range(['#ca0020','#f4a582','#92c5de','#0571b0'])//vaccine coverage--high=good
//     //   .range(['#0571b0','#92c5de','#f4a582','#ca0020'])//personal belief--low=good
//     // return color;
//
//
//
//     //JENKS CLASSIFICATION
//     // var color=d3.scale.threshold()
//     //   .domain([])
//     //
//   // var colorClasses=objectColors[expressed];
//   //
//   // var colorScale=d3.scale.threshold()
//   //     .range(colorClasses);
//   //
//   // var domainArray=[];
//   // for (var i=0; i<data.length; i++){
//   //   var val=parseFloat(data[i][expressed]);
//   //       domainArray.push(val);
//   // };
//   //
//   // var clusters=ss.ckmeans(domainArray, 4);
//   // domainArray=clusters.CAmap(function(d){
//   //   return d3.min(d);
//   // });
//   //
//   // domainArray.shift();
//   //
//   // colorScale.domain(domainArray);
//   //
//   // return colorScale;
//
//
//
//
//   var colorScale=d3.scale.quantile()//use quantile for scale generator
//          .range(['#ca0020','#f4a582','#92c5de','#0571b0']);//incorporate objectColors array to change depending on variable
//
// //creating equal interval classifcation
//  var minmax = [
//        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
//        d3.max(data, function(d) { return parseFloat(d[expressed]); })
//    ];
//    //assign two-value array as scale domain
//    colorScale.domain(minmax);
//    return colorScale;
//
// };


//
//
// //creation of choropleth CAmap
// function choropleth(props, colorScale){
//   var value = parseFloat(props[expressed]);
//
//   if(isNaN(value)){
//         return "purple";//no value
//     } else if (value==0){
//         return "gray";//for case of Political_Filtering with a score of 0
//     } else{
//         return colorScale(value);
//     }
//   };
