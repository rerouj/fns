// personal note : swiss boundaries should be converted to WGS84 (QGIS)

//define svg "screen"    
var svg = d3.select("body").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 450")
    .attr('id', 'screen')

//define groupe layers
var g = d3.select('svg').append('g').attr("transform", "translate(200,10)"); // g's are svg groups. Very usefull for layering elements with similar shapes
    g5 = d3.select('svg').append('g').attr('class', 'legend').attr("transform", "translate(80,0)"),
    g3 = d3.select('svg').append('g').attr('class', 'circles').attr("transform", "translate(200,10)"),
    g2 = d3.select('svg').append('g').attr("transform", "translate(200,10)");

//append text (bubles text) to layer 5
var uniName = g5.append("text")
var uniCount = g5.append("text")
var uniSumAmount = g5.append("text")
var uniMeanAmount = g5.append("text")
var uniMedAmount = g5.append("text")

//draw the Switzerland map
d3.json('datasets/topo_ds/topo/ch2.geojson', function(json) {

  //define projection
  var projection = d3.geoMercator()
    projection.fitSize([550, 400], json);
  //define geopath  
  var geoGenerator = d3.geoPath()
    .projection(projection);
  //declare draw function function
  function update(geojson) {
    g.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .style("fill", "white")
    .style("stroke", "black") 
    .style("stroke-width", 0.2)  
    .attr('d', geoGenerator);
  }
  update(json);
  //append places name data set
  d3.csv('datasets/topo_ds/topo/places.csv', function(data) { // I could have use a geojson file

    g2.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
        .attr('cx', (d) => projection([d.LONGITUDE, d.LATITUDE])[0])
        .attr('cy', (d) => projection([d.LONGITUDE, d.LATITUDE])[1]) 
        .attr("r", 3)
        .style("fill", "grey")
        .style("opacity", 0.5)

    g2.selectAll(".labels")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "labels")
      .attr("font-size", "10px")
      .text((d) => d.NAME)
      .attr("x", (d) => projection([d.LONGITUDE, d.LATITUDE])[0]+15)
      .attr("y", (d) => projection([d.LONGITUDE, d.LATITUDE])[1]+5)
      .style("fill", "grey") 
  });
  // set default toggle selection
  change('uni')
  //append to toggle the change() function
  d3.select('#sel').on('change', change)

//declare change() function : "change" controls the selector behaviour on toggle select
function change(){ 
  //get selected value
  const vals = d3.select('#sel').property('value')
  //append main dataset
  d3.csv('datasets/uni_latlng_count_nat_extended2.csv', function (error, data) {

    //define scale for the red circles
    const r = d3.scaleLinear()
      .domain([d3.min(data, d=>Number(d.count)),d3.max(data, d=>Number(d.count))])
      .range([10,45])
    //refresh when toggle select
    g3.selectAll('circle').remove().exit()
    //append circles
    g3.selectAll('circle').data(data)
    .enter()
    .append('circle')
    //(get selected value) filter by institution type
    .filter(function(d){return d.type == vals})
        .attr('cx', (d) => projection([d.lng, d.lat])[0])
        .attr('cy', (d) => projection([d.lng, d.lat])[1]) 
        .attr("r", (d) => r(d.count))
        .style("fill", "red")
        .style("opacity", 0.25)
        //mouse behaviour : on mouse over circles append specific data about the institutions selected
        .on("mouseover", function(d) {
          uniName.attr("x", projection([d.lng, d.lat])[0])
          .attr("y", projection([d.lng, d.lat])[1]-30)
          .text(d.university)
          .attr("font-family", "sans-serif")
          .attr('font-weight', 'bold')
          .attr("font-size", "14px")
          .attr("fill", "black")
          uniCount.attr("x", projection([d.lng, d.lat])[0])
          .attr("y", projection([d.lng, d.lat])[1])
          .text(`Projets (freq.) : ${d.count}`)
          .attr("font-family", "sans-serif")
          .attr('font-weight', 'bold')
          .attr("font-size", "10px")
          .attr("fill", "black")
          uniSumAmount.attr("x", projection([d.lng, d.lat])[0])
          .attr("y", projection([d.lng, d.lat])[1]+20)
          .text(`Financements (total) : ${d.amount_sum}.-`)
          .attr("font-family", "sans-serif")
          .attr('font-weight', 'bold')
          .attr("font-size", "10px")
          .attr("fill", "black")
          uniMeanAmount.attr("x", projection([d.lng, d.lat])[0])
          .attr("y", projection([d.lng, d.lat])[1]+40)
          .text(`Financements (moy.) : ${d.amount_mean}.-`)
          .attr("font-family", "sans-serif")
          .attr('font-weight', 'bold')
          .attr("font-size", "10px")
          .attr("fill", "black")
          uniMedAmount.attr("x", projection([d.lng, d.lat])[0])
          .attr("y", projection([d.lng, d.lat])[1]+60)
          .text(`Financements (med.) : ${d.amount_median}.-`)
          .attr("font-family", "sans-serif")
          .attr('font-weight', 'bold')
          .attr("font-size", "10px")
          .attr("fill", "black")
          g2.transition().duration(500).style('opacity', .3)
          d3.select(this).transition()		
          .duration(350)
          .attr('r', 150)		
          uniName.transition()		
              .duration(1000)		
              .style("opacity", .9);
          uniCount.transition()
              .duration(1000)
              .style('opacity', .9)
          uniSumAmount.transition()
              .duration(1000)
              .style('opacity', .9)	
          uniMeanAmount.transition()
              .duration(1000)
              .style('opacity', .9)	    			
          uniMedAmount.transition()
              .duration(1000)
              .style('opacity', .9)	    			
          })
          .on("mouseout", function(d) {		
            uniName.transition()		
                .duration(500)		
                .style("opacity", 0);	
            uniCount.transition()		
                .duration(500)		
                .style("opacity", 0);
            uniSumAmount.transition()		
                .duration(500)		
                .style("opacity", 0);
            uniMeanAmount.transition()		
                .duration(500)		
                .style("opacity", 0);
            uniMedAmount.transition()		
                .duration(500)		
                .style("opacity", 0);	
            d3.select(this).transition().duration(500).attr('r', (d) => r(d.count))		
            g2.transition().duration(500).style('opacity', 1)

        });
		
      });
    }
  })

//legend and credit

g5.append('text').attr("x", 36)
                .attr("y", 110)
                .text('Projets soutenus (fréq)')
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black");

g5.append('text').attr("x", 36)
                .attr("y", 133)
                .text('Université / instit.')
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black");

g5.append('text').attr("x", 36)
                .attr("y", 158)
                .text('Villes')
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black");

g5.append('text').attr("x", 500)
                .attr("y", 420)
                .text('Source : opendata.swiss, Dataset : FNS export p3')
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black");

g5.append('text').attr("x", 500)
                .attr("y", 435)
                .text('Crédit : Renato Diaz')
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black");

g5.append('circle')
  .attr('cx', 13)
  .attr('cy', 104) 
  .attr("r", 6)
  .style("fill", "white")
  .style('stroke','black')
  .style("stroke-width", 1)

g5.append('circle')
  .attr('cx', 21)
  .attr('cy', 104) 
  .attr("r", 9)
  .style("fill", "transparent")
  .style('stroke','black')
  .style("stroke-width", 1) 

g5.append('circle')
  .attr('cx', 21)
  .attr('cy', 128) 
  .attr("r", 7)
  .style("fill", "red")
  .style('opacity', 0.5)

g5.append('circle')
  .attr('cx', 21)
  .attr('cy', 155) 
  .attr("r", 7)
  .style("fill", "grey")
  .style('opacity', 0.5)