const svg = d3.select("#timeline")
const svgLegend = d3.select("#legend")
const margin = {top: 40, right: 40, bottom: 40, left: 60};
const padding = 0;
const width = +svg.attr("width");
const height = +svg.attr("height");

const fontFamily = "sans-serif";
const fontScale = 15;
const radius = 3;  //rayon des points

//parse le format "xxxx-xx-xx" en date
const parseDate = d3.timeParse("%Y-%m-%d");
//intervalle de la chronologie
var intervalle = ["1733-01-01", "1895-12-31"]

//transforme la date en un string
function formatDate(date) {
  return date.toLocaleString("fr", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

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


//
function createColorScale(values){
  var w = svgLegend.node().getBoundingClientRect().width
  console.log(w)
  var colors = Array.from(values)
  color.domain(colors);

  var scale = w / colors.length;
  
  function getPosition(d){
    var h = colors.indexOf(d) * scale + 20
    return h
  }
  
  
  //make legend
  var legend = svgLegend.append("g")
      .attr("transform", `translate(0,20)`)
  

  var circles = legend
    .selectAll("circle")
    .data(colors)
    .enter()
    .append("circle")
    .style("fill", c => color(c))
    .attr("class", "dot")
    .attr("r", 10)
    .attr("cx", c => getPosition(c))
    .attr("cy", 15)
  var labels = legend.append('g').attr('class', 'labels');

  labels.selectAll('.label')
  .data(colors)
  .enter()
  .append('text')
    .attr("class", "label")
    .attr('transform', (d => "translate(" + getPosition(d) + ","+ 15 + ")"))
    .attr("id", (d => "color"+d))
    .style('text-anchor', 'middle')
    .style('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .text(d => d);

  labels.selectAll(".label")
    .call(wrap, scale, 0)

  legend.append("text")
      .attr("class", "caption")
      .attr("y", -10)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .style('font-family', 'sans-serif')
      .attr("font-size", "14px")
      .text("Légende des couleurs");


  return svgLegend.node()

};


//crée la base pour la chronologie

//d3 Documentation
//- https://github.com/d3/d3-scale#time-scales

//source: 
// - https://observablehq.com/@lenamk/testing-time-scales
// - https://observablehq.com/@tezzutezzu/world-history-timeline
// - https://observablehq.com/@d3/stacked-horizontal-bar-chart
function timeline(time, dataset){
  console.log("let's create a timeline for: ")
  console.log(dataset)


  //create svg space for the timline
    svg
      .attr("viewBox", [0, 0, width, height])
      .attr("font-family", fontFamily)
      .attr("text-anchor", "middle");
  
  const g = svg.append("g").attr("transform", (d,i)=>`translate(0, ${margin.top})`);

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

  //var x2Axis = (g, x) => g
  //  .attr("transform", `translate(0,${height - margin.bottom})`)
  //  .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

  var yAxis = (g, y) => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s").tickSize(-(width-margin.left-margin.right)))
    .call(g => g.select(".domain").remove()) //enlève la ligne verticale
    .call(g => g.selectAll(".tick line").attr("stroke", (d, i) => i ? "#bbb" : null)) 
    //crée une ligne pour chaque y

  
  //Some interactivity
  //const tooltip = d3.select(document.createElement("div")).call(createTooltip);

  

  //bind data and add class "person"
  const people = g
    .selectAll("g")
    .data(dataset)
    .enter()
    .append("g")
    .attr("class", "person")

  //for each person, addPerson to the timeline
  people
    .each(addPerson)

    /*
    .on("mouseover", function(d) { //some interactivity
      d3.select(this).select("rect").attr("fill", d.color.darker())

      tooltip
        .style("opacity", 1)
        .html(getTooltipContent(d))
    })
      .on("mouseleave", function(d) {
      d3.select(this).select("rect").attr("fill", d.color)
      tooltip.style("opacity", 0)
    })*/


  //Append axes
  const gx = svg.append("g")
    .call(xAxis, x);

  svg.append("g")
      .call(yAxis, y);

  
  const line = svg.append("line").attr("y1", margin.top-10).attr("y2", height-margin.bottom).attr("stroke", "rgba(0,0,0,0.2)").style("pointer-events","none");

  //some interactivity

  svg.on("mousemove", function(d) {

    let [x,y] = d3.mouse(this);
    line.attr("transform", `translate(${x} 0)`);
    y +=20;
    if(x>width/2) x-= 100;

    /*tooltip
      .style("left", x + "px")
      .style("top", y + "px") */
  }) 

  
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
    .style("font-size", "11px")
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
  console.log(this)
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
    .style("font-size", "11px")
    .style("fill", "#800000")
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
    //si les deux sont connu
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


  //faire un rectangle pour chaque range
  const rects = el
  .selectAll("rect") //Attention quand on a plusieurs personnes ça risque de planter ça --> ne plante pas parce qu'on est dans "person" donc pas de confusion
  .data(ranges)
  .enter()
  .append("rect")
  .attr("x", r => x(parseDate(r.start)))
  .attr("y", person-(y.bandwidth()/2)) //pour centrer le rectangle sur la ligne (et non qu'il soit en dessous)
  .attr("height", y.bandwidth())
  .attr("width", r => (x(parseDate(r.end)) - x(parseDate(r.start))))
  .attr("fill", r => color(r.label))//TODO : make a color range
  .attr("fill-opacity","0.5")
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
  .on("mouseover", handleMouseOverCircle)
  .on("mouseout", handleMouseOutCircle);

  el
    .append("text")
    .text(d.properties.name)
    .attr("x", startLife + 3)
    .attr("y", person - 15)
    .attr("fill", "black")
    .style("font-size", "10px")
    .style("text-anchor", "start")
    .style("dominant-baseline", "hanging");



}

Promise.all([
  d3.json('../data/prosopo.json')
]).then(([data]) => {
  
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

  var vip = new Set (["gourlier", "rohault", "hurtault", "heurtier", "blouet", "caristie"])
  console.log(vip)

  dataset = data.features.filter(d => vip.has(d.properties.id))
  console.log(dataset)
  
  timeline(intervalle, data.features);


});
