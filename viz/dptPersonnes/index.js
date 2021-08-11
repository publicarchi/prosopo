const svg = d3.select("#people")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
const margin = {top: 40, right: 40, bottom: 40, left: 60};
const padding = 0;
const width = +svg.attr("width") - margin.left - margin.right;
const height = 300;

const fontFamily = "sans-serif";
const fontScale = 15;
const rotate = 0 // () => (~~(Math.random() * 6) - 3) * 30

function showDptPeople(data, y){
  var localh = y + height;
  console.log(data.dpt)
  console.log(localh)
  var dptView = svg.append("g")
        .attr("viewBox", [0, localh, width, height])
        .attr("class", "dpt")
  
  dptView 
        .append("text")
          .attr("y", localh)
          .attr("x", margin.left)
          .text(data.dpt);

  const g = dptView.append("g")

  const groups = g
    .selectAll("g")
    .data(data.roles)
    .enter()
    .append("g")
    .attr("class", "role")
  
  groups.each(g => console.log(g))
  
  return svg.node();

}

Promise.all([
  d3.json('../data/dptPersonnes.json'),
  d3.json('../data/departements-version-simplifiee.geojson')
]).then(([data, map]) => {
  console.log(data)
  console.log(map)
  //make a small map as selector


  //for each dpt
  /*
  var num = 0;
  data.forEach(d => {
    showDptPeople(d, num)
    num += height;
  }*/

  showDptPeople(data[0], 0)
});
