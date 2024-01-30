const svg = d3.select("#people")
const margin = {top: 40, right: 40, bottom: 40, left: 60};
const padding = 0;
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const fontFamily = "sans-serif";
const fontScale = 15;
const rotate = 0 // () => (~~(Math.random() * 6) - 3) * 30

function cloudPersonnes(data){

  svg.attr("viewBox", [0, 0, width, height])
      .attr("font-family", fontFamily)
      .attr("text-anchor", "middle");

  const cloud = d3.layout.cloud()
      .size([width, height])
      .words(data)
      .padding(padding)
      .rotate(rotate)
      .font(fontFamily)
      .fontSize(d => {
        return Math.sqrt(d.occurences * fontScale)
      })
      .on("word", ({size, x, y, rotate, person}) => {
        svg.append("text")
            .attr("font-size", size)
            .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
            .text(person);
      });

  cloud.start();
  //invalidation.then(() => cloud.stop());
  return svg.node();

}

Promise.all([
  d3.json('../data/personnes.json')
  //version test  d3.json('../data/personnes-test.json')
]).then(([data]) => {
  console.log(data)
  


/* test pour faire des groupes par "group" .. d3.group ne fonctionne pas
  var subset = data.filter(d => d.hasOwnProperty("group") && d.group == "architecte" )

  console.log(subset)

  var groupes = d3.group(subset, function(d){
    console.log(d)
    return d.group
  });

  console.log(groupes)
  */


  cloudPersonnes(data);

});
