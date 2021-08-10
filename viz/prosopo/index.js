const svg = d3.select("#timeline")
const margin = {top: 40, right: 40, bottom: 40, left: 60};
const padding = 0;
const width = +svg.attr("width");
const height = +svg.attr("height");

const fontFamily = "sans-serif";
const fontScale = 15;

//parse le format "xxxx-xx-xx" en date
const parseDate = d3.timeParse("%Y-%m-%d");

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

const color = d3.scaleOrdinal(d3.schemeCategory10) //10catégories!
//
function createColorScale(values){
  color.domain(Array.from(values));
  console.log(color.domain())
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

  var yAxis = (g, y) => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s").tickSize(-(width-margin.left-margin.right)))
    .call(g => g.select(".domain").remove()) //enlève la ligne verticale
    .call(g => g.selectAll(".tick line").attr("stroke", (d, i) => i ? "#bbb" : null)) 
    //crée une ligne pour chaque y


  

  //bind data and add class "person"
  const people = g
    .selectAll("g")
    .data(dataset)
    .enter()
    .append("g")
    .attr("class", "person")

  //people.attr("transform", (d,i)=>`translate(0,${y(d.properties.id)})`)


  //for each person, addPerson to the timeline
  people.each(addPerson)


  //Append axes
  const gx = svg.append("g")
      .call(xAxis, x);

  svg.append("g")
      .call(yAxis, y);
  
  
  return svg.node();

}



//Ajoute l'information sur une personne dans la chronologie
function addPerson(d){
  const el = d3.select(this);

  //d est la personne pour laquelle on ajoute des informations
  console.log("let's add "+d.properties.name)
  console.log(d)

  //À propos de la personne
  //Attention à gérer si ce n'est pas renseigné
  const birth = d.chronometry.filter(t => t.label=="date de naissance")[0];
  const death = d.chronometry.filter(t => t.label=="date de décès")[0];
  const points = d.chronometry.filter(t => t.type=="point");
  const ranges = d.chronometry.filter(t => t.type=="range");
  const startLife = x(parseDate(birth.date));
  const endLife = x(parseDate(death.date));
  const widthLife = endLife - startLife;
  const person = y(d.properties.id)-(y.bandwidth()/2);


  //faire un rectangle pour chaque range
  const rects = el
  .selectAll("rect") //Attention quand on a plusieurs personnes ça risque de planter ça
  .data(ranges)
  .enter()
  .append("rect")
  .attr("x", r => x(parseDate(r.start)))
  .attr("y", person-(y.bandwidth()/2)) //pour centrer le rectangle sur la ligne (et non qu'il soit en dessous)
  .attr("height", y.bandwidth())
  .attr("width", r => (x(parseDate(r.end)) - x(parseDate(r.start))))
  .attr("fill", r => color(r.label))//TODO : make a color range
  .attr("fill-opacity","0.5")



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
  .attr("r", 3) //rayon des points
  .attr("cx", p => x(parseDate(p.date)))
  .attr("cy", person)
  .on("mouseover", function (d){
    d => console.log(d.properties.id));
  //TODO: ajouter interactivité: date on hover

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
  var intervalle = ["1733-01-01", "1895-12-31"]
  timeline(intervalle, dataset);


});
