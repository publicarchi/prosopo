const svg = d3.select("#people")
const margin = {top: 40, right: 40, bottom: 40, left: 60};
const padding = 0;
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const fontFamily = "sans-serif";
const fontScale = 15;
const rotate = 0 // () => (~~(Math.random() * 6) - 3) * 30

function viewPersonnes(data){

  svg.attr("viewBox", [0, 0, width, height])
      .attr("font-family", fontFamily)
      .attr("text-anchor", "middle");

  
  return svg.node();

}

Promise.all([
  d3.json('../data/dptPersonnes.json')
  //version test  d3.json('../data/personnes-test.json')
]).then(([data]) => {
  console.log(data)
  //make a small map as selector
  viewPersonnes(data);

});
