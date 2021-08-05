const svg = d3.select("#timeline")
const margin = {top: 40, right: 40, bottom: 40, left: 60};
const padding = 0;
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const fontFamily = "sans-serif";
const fontScale = 15;

//parse le format de date
const parseDate = d3.timeParse("%Y-%m-%d");



//crée la base pour la chronologie

//d3 Documentation
//- https://github.com/d3/d3-scale#time-scales

//source: 
// - https://observablehq.com/@lenamk/testing-time-scales
// - https://observablehq.com/@tezzutezzu/world-history-timeline
// - https://observablehq.com/@d3/stacked-horizontal-bar-chart
function timeline(time, dataset){

  //create svg space for the timline
    svg
      .attr("viewBox", [0, 0, width, height])
      .attr("font-family", fontFamily)
      .attr("text-anchor", "middle");
  
  const g = svg.append("g").attr("transform", (d,i)=>`translate(${margin.left} ${margin.top})`);

  //Define axes
  const x = d3.scaleUtc()
    .domain([parseDate(time[0]), parseDate(time[1])])
    .range([margin.left, width - margin.right])

  const y = d3.scaleBand()
    .domain(dataset.map(d => d.properties.id))
    .range([0,height - margin.bottom - margin.top])
    .padding(0.2)

  //for each element in dataset, addPerson
  dataset.forEach(person => addPerson(person));


  //Build axes
  var xAxis = (g, x) => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

  var yAxis = (g, y) => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", -margin.left)
        .attr("y", -margin.top)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Personnes"))  

  const gx = svg.append("g")
      .call(xAxis, x);

  svg.append("g")
      .call(yAxis, y);
  
  
  return svg.node();

}

//Ajoute l'information sur une personne dans la chronologie
function addPerson(person){

console.log("let's add "+person.properties.name)


}

Promise.all([
  d3.json('../data/prosopo.json')
]).then(([data]) => {
  console.log(data)
  
  dataset = data.features.filter(d => d.properties.id == "gourlier")

  var intervalle = ["1795-01-01", "1895-12-31"]
  timeline(intervalle, dataset);


});
