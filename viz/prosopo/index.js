const svg = d3.select("#timeline")
const svgLegend = d3.select("#legend")

const svgTopAxis = d3.select("#axisTop")
const margin = {top: 5, right: 40, bottom: 40, left: 60};
const padding = 0;
const width = svg.attr("width");
const height = svg.attr("height");

const fontFamily = "sans-serif";
const fontScale = 15;
const radius = 3;  //rayon des points

//parse le format "xxxx-xx-xx" en date
const parseDate = d3.timeParse("%Y-%m-%d");

//parse le format date en "xxxx-xx-xx"
const parsePosition = d3.timeFormat("%Y-%m-%d");

//line verticale sur le graphique
const line = svg.append("line")
  .attr("y1", 0)
  .attr("y2", height-margin.bottom)
  .attr("stroke", "grey")
  .style("pointer-events","none");


//intervalle de la chronologie
var intervalle = ["1733-01-01", "1895-12-31"]

//Create axes
const x = d3.scaleUtc()
const y = d3.scaleBand() //doc: https://observablehq.com/@d3/d3-scaleband

const color = d3.scaleOrdinal(d3.schemeSet3) //12catégories!

//wrap text in legend
//https://observablehq.com/@dagonar/text-wrap-axis
function wrap(text, wrapWidth, yAxisAdjustment = 0) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = 5,
        dy = parseFloat(2) - yAxisAdjustment,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", `${dy}em`);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > wrapWidth) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
  return 0;
}


//color scale + légende
function createColorScale(values){
  var w = svgLegend.node().getBoundingClientRect().width - margin.left
  console.log(w)
  var colors = Array.from(values)
  color.domain(colors);

  var scale = w / colors.length ;
  
  function getPosition(d){
    var h = colors.indexOf(d) * scale + 20
    return h
  }
  
  
  //make legend
  var legend = svgLegend.append("g")
      .attr("transform", `translate(${margin.left},8)`)
  
  var circles = legend.append("g").attr('class', 'circles');

  circles
    .selectAll("circle")
    .data(colors)
    .enter()
    .append("circle")
    .style("fill", c => color(c))
    .attr("class", "dot")
    .attr("r", 10)
    .attr("cx", c => getPosition(c))
    .attr("cy", 2)

  var labels = legend.append('g').attr('class', 'labels');

  labels.selectAll('.label')
  .data(colors)
  .enter()
  .append('text')
    .attr("class", "label")
    .attr('transform', (d => "translate(" + getPosition(d) + ","+ 2 + ")"))
    .attr("id", (d => "color"+d))
    .style('text-anchor', 'middle')
    .style('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .text(d => d);

  labels.selectAll(".label")
    .call(wrap, scale, 0)

 
  return svgLegend.node()

};

function topAxis(x, reorg){
  svgTopAxis
      .attr("viewBox", [0, 0, width, 30])
      .attr("font-family", fontFamily)
      .attr("text-anchor", "middle");

  var xTopAxis = svgTopAxis
    .append("g")
  
  //ligne qui place la souris
  const topLine = svgTopAxis 
    .append("line")
    .attr("y1", -25)
    .attr("y2", 50)
    .attr("stroke", "grey")
    .style("pointer-events","none");

  //label qui indique la date à laquelle se trouve la souris ()
  const topLabel = svgTopAxis
    .append("text")
    .attr("id", "currentDate")
    .attr("x", margin.left)
    .attr("y", 8)
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('text-anchor', 'end')
    .attr("class", "label")

  
  xTopAxis  
    .attr("transform", `translate(0, 10)`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
  
   //add reset button
   var reset = svgTopAxis.append("g")
   .attr("transform", `translate(0,8)`)
   .attr("id", "reset")
  var resetX = 5;
  var resetY = 5;
  
  reset.append('rect')
    .attr("x", resetX-5)
    .attr("y", resetY-15)
    .attr("width", 70)
    .attr("height", 25)
    .attr("id", "resetZone")
    .attr("color", "black")
    .attr("fill", "lightgrey")
  
  reset.append('text')
    .attr('transform', (d => "translate(" + resetX + ","+ resetY + ")"))
    .attr('border', "black")
    .attr("id", "resetText")
    .style('text-anchor', 'start')
    .style('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .text("Tout afficher"); 

  //interactivity
  svgTopAxis.on("mousemove", function(d) {

    let posX = d3.mouse(this)[0];

    if (posX > margin.left){
      //placer les lignes verticales là où est la souris
      topLine.attr("transform", `translate(${posX}, 0)`);
      line.attr("transform", `translate(${posX} 0)`);
    }

    
    
    //inscrire la date concernée
    var cDate = x.invert(posX)
    topLabel.text(parsePosition(cDate).substr(0,7)); //show only year and month

    svg.selectAll(".person")
      .attr("visibility", "visible")
      .filter( d => {
        var ranges = d.chronometry.filter(t => t.type == "range")
        var show = false;
        ranges.forEach(r => {
          if (x(parseDate(r.start)) <= posX && posX <= x(parseDate(r.end))) {
            show = true;
          }
        })
        if (show == false)
          d3.select("#"+d.properties.id).attr("visibility", "collapse") 
      })
  }) 
    
  //Append réorganisations
  const conseil = svgTopAxis.append("g")
  conseil
    .selectAll("line")
    .data(reorg)
    .enter()
    .append("line")
      .attr("class", "cbc")
      .attr("y1", -25)
      .attr("y2", 10)
      .attr("stroke", "purple")
      .attr("transform", d => `translate(${x(parseDate(d.date))}, 0)`)
      .on("mouseover", d => console.log(d.nom + ": " + d.date_fr)) //to better

  return svgTopAxis.node()
}

//crée la base pour la chronologie

//d3 Documentation
//- https://github.com/d3/d3-scale#time-scales

//source: 
// - https://observablehq.com/@lenamk/testing-time-scales
// - https://observablehq.com/@tezzutezzu/world-history-timeline
// - https://observablehq.com/@d3/stacked-horizontal-bar-chart

function timeline(time, dataset, reorg){
  console.log("let's create a timeline for: ")
  console.log(dataset)

  //Add axes domain and range
  x
    .domain([parseDate(time[0]), parseDate(time[1])])
    .range([margin.left, width-margin.right])

  y
    .range([margin.top, height-margin.bottom])
    .domain(dataset.map(d => d.properties.id))
    .padding(0.2)

  //Build axes
  var xAxis = (g, x) => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

  //create svg space for the timeline
  svg
    .attr("viewBox", [0, 0, width, height])
    .attr("font-family", fontFamily)
    .attr("text-anchor", "middle");
  
  const g = svg.append("g").attr("transform", `translate(0, ${margin.top})`);
  
  //make grey background (rectangles) before first and after last appearance
  var firstA = d3.min(dataset, d => d.firstA)
  var lastA = d3.max(dataset, d => d.lastA)
  svg.append('rect')
    .attr("x", margin.left)
    .attr("y", 0)
    .attr("width", x(parseDate(firstA)) - margin.left)
    .attr("height", height)
    .attr("id", "resetZone")
    .attr("color", "black")
    .attr("fill", "lightgrey")
    .attr("opacity", "20%")

    svg.append('rect')
    .attr("x", x(parseDate(lastA)))
    .attr("y", 0)
    .attr("width", width - x(parseDate(lastA)))
    .attr("height", height)
    .attr("id", "resetZone")
    .attr("color", "black")
    .attr("fill", "lightgrey")
    .attr("opacity", "20%")

  topAxis(x, reorg)

  
  
  //bind data and add class "person"
  const people = g
    .selectAll("g")
    .data(dataset)
    .enter()
    .append("g")
    .attr("class", "person")
    .attr("visibility", "visible")
    .attr("id", d => d.properties.id)

  //for each person, addPerson to the timeline
  people
    .each(addPerson)

  //Append axes
  const gx = svg.append("g")
    .call(xAxis, x);


  return svg.node();

}

//interactivité cercles
//d continent les données, c-a-d la chronométrie du point en question
//this = element svg (cercle) en question
function handleMouseOverCircle(d) { 
  var localheight =  d3.select(this). attr("cy");

  // Use D3 to select element, change color and size
  d3.select(this)
   .attr("r", radius * 2);

  // Specify where to put label of text
  svg.append("text")
    .attr("id", "t" + d.date)
    .attr("x", x(parseDate(d.date)) + 20)
    .attr("y", localheight)
    .attr("class", "label")
    .text(d.label + ": " + d.date);
}

function handleMouseOutCircle(d) {
  // Use D3 to select element, change color back to normal
  d3.select(this)
    .attr("r", radius);

  // Select text by id and then remove
  d3.select("#t" + d.date ).remove();  // Remove text location
}

//interactivité rectangles
//d continent les données, c-a-d la chronométrie du range en question
//this = element svg (rectangle) en question
function handleMouseOverRect(d) { 

  var height = d3.select(this).attr("y")
  var localheight =  Number(height) - 100

  var localx = d3.select(this).attr("x");


  // Use D3 to select element, change color and size
  d3.select(this)
   .attr("style", "outline: thin solid black");

  // Specify where to put label of text
  svg.append("text")
    .attr("id", "t" + d.start)
    .attr("x", localx)
    .attr("y", localheight + 150)
    .attr("class", "label")
    .attr("text-anchor", "start")
    .text(d.label + " de " + d.start + " à " + d.end);
}

function handleMouseOutRect(d) {
  // Use D3 to select element, change color back to normal
  d3.select(this)
  .attr("style", "outline: none");

  // Select text by id and then remove
  d3.select("#t" + d.start ).remove();  // Remove text location
}

//Ajoute l'information sur une personne dans la chronologie
function addPerson(d){
  const el = d3.select(this);

  //d est la personne pour laquelle on ajoute des informations
  //console.log("let's add "+d.properties.name)
  //console.log(d)

  //À propos de la personne
  //Attention à gérer si ce n'est pas renseigné
  const birth = d.chronometry.filter(t => t.label=="date de naissance")[0];
  const death = d.chronometry.filter(t => t.label=="date de décès")[0];
  const points = d.chronometry.filter(t => t.type=="point");
  const ranges = d.chronometry.filter(t => t.type=="range");
  var startLife;
  var endLife;
  //gestion inconnnu dates naissance et mort
  if (birth && birth.date && death && death.date){
    //si les deux sont connus
    startLife = x(parseDate(birth.date)); 
    endLife = x(parseDate(death.date));
  }
  else if (birth && birth.date){
    //si on connaît la date de naissance mais pas de mort
    //--> date de naissance + 120ans (Facile à repérer car trop long, à gérer par la suite)
    //max = debut intervalle

    startLife = x(parseDate(birth.date)); 

    var annee = Number(birth.date.substr(0,4)) + 120;
    if (annee > Number(intervalle[1].substr(0,4)))
      endLife = x(parseDate(intervalle[1]));
    else   
    endLife = x(parseDate(annee.toString()+"-01-01"));

  }
  else if (death && death.date){
    // ex: Bourla date de naissance inconnue à gérer 
    //--> date de mort - 120ans (Facile à repérer car trop long, à gérer par la suite)

    endLife = x(parseDate(death.date));

    var annee = Number(death.date.substr(0,4)) - 120;
    if (annee < Number(intervalle[0].substr(0,4)))
      startLife = x(parseDate(intervalle[0]));
    else   
      startLife = x(parseDate(annee.toString()+"-01-01"));

  }
  else {
    //si on ne connait rien
    //les dates de la chronologie, pour signifier l'inconnu facilement
    startLife = x(parseDate(intervalle[0]));
    endLife = x(parseDate(intervalle[1]));
    
  }
  const widthLife = endLife - startLife;
  const person = y(d.properties.id)-(y.bandwidth()+6);
  
  //crée la ligne de référence
  el
    .append("line")
    .attr("class", "refLine")
    .attr("x1", x(parseDate(intervalle[0])))
    .attr("x2", x(parseDate(intervalle[1])))
    .attr("y1", person)
    .attr("y2", person)
    .attr("stroke", "silver")
    .attr("stroke-width", "1px")
    .attr("visibility", "inherit")
    .on("click", d => console.log(d))

  var xlabel = margin.left - 2
  //ajoute le id dans la marge
  el
    .append("text")
    .text(d.properties.id)
    .attr("x", xlabel)
    .attr("y", person - margin.top)
    .attr("fill", "silver")
    .attr("visibility", "inherit")
    .style("font-size", "10px")
    .style("text-anchor", "end")
    .style("dominant-baseline", "hanging");  

  //faire un rectangle pour chaque range
  const rects = el
  .selectAll("rect")
  .data(ranges)
  .enter()
    .append("rect")
    .attr("x", r => x(parseDate(r.start)))
    .attr("y", person-(y.bandwidth()/2)) //pour centrer le rectangle sur la ligne (et non qu'il soit en dessous)
    .attr("height", y.bandwidth())
    .attr("width", r => (x(parseDate(r.end)) - x(parseDate(r.start))))
    .attr("fill", r => color(r.label))
    .attr("fill-opacity","0.5")
    .attr("visibility", "inherit")
    .on("mouseover", handleMouseOverRect)
    .on("mouseout", handleMouseOutRect);

  //crée la ligne de vie
  el
    .append("rect")
    .attr("class", "lifeline")
    .attr("x", startLife)
    .attr("y", person)
    .attr("height", "1px")
    .attr("width", widthLife)
    .attr("fill", "black")
    .attr("visibility", "inherit")

  //faire un point pour chaque point
  const dots = el
  .selectAll("circle") //Attention quand on a plusieurs personnes ça risque de planter ça
  .data(points)
  .enter()
  .append("circle")
  .style("fill", "black")
  .attr("class", "dot")
  .attr("r", radius)
  .attr("cx", p => x(parseDate(p.date)))
  .attr("cy", person)
  .attr("visibility", "inherit")
  .on("mouseover", handleMouseOverCircle)
  .on("mouseout", handleMouseOutCircle);

  el
    .append("text")
    .text(d.properties.name)
    .attr("x", startLife + 3)
    .attr("y", person - 15)
    .attr("fill", "black")
    .attr("visibility", "inherit")
    .style("font-size", "10px")
    .style("text-anchor", "start")
    .style("dominant-baseline", "hanging");

}

Promise.all([
  d3.json('../data/prosopo.json'),
  d3.json('../data/reorganisations.json')
]).then(([data, reorg]) => {
  
  var indexRoles = new Set();
  //types de roles
  data.features.forEach(p => {
    var range = p.chronometry.filter(t => t.type == "range")
    range.forEach(t => {
      if (!(t.label in indexRoles))
          indexRoles.add(t.label)

    })
  })
  createColorScale(indexRoles);

  //var vip = new Set (["gourlier", "rohault", "hurtault", "heurtier", "blouet", "caristie"])
  //dataset = data.features.filter(d => vip.has(d.properties.id))

  //add firstApparance property
  //var richData = 
  
  data.features.forEach(d => {
    var ranges = d.chronometry.filter(t => t.type == "range")
    var starts = []
    var ends = []
    ranges.forEach(r => {
      starts.push(r.start)
      ends.push(r.end)
    })
 
    
    d.firstA = d3.min(starts);
    d.lastA = d3.max(ends)
    

  })

  //var filteredData = data.features.filter(d => d.chronometry)
  
  var sortedDate = data.features.sort((a, b) => d3.ascending(a.firstA, b.firstA))

   
  
  //data.features.sort((a, b) => d3.ascending(d3.min(a.chronometry.filter(t => t.type == "range")), d3.min(b.chronometry.filter(t => t.type == "range"))))
  
  
  
  /*{
    var startDates = a.chronometry.filter(t => t.type == "range")
    console.log(startDates)
    console.log(d3.min(startDates))
    
  }  */
    
    
    //d3.ascending(a.chronometry.)
  
  
  timeline(intervalle, sortedDate, reorg);


});
