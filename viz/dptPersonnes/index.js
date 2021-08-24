var allData;
const svgPeople = d3.select("#people")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
const svgMap = d3.select("#map")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)

const svgVIP = d3.select("#VIP")
.attr("font-family", "sans-serif")
.attr("font-size", 10)
 
const marginPeople = {top: 40, right: 40, bottom: 40, left: 60};
const marginMap = {top: 40, right: 40, bottom: 40, left: 60};

const widthP = svgPeople.attr("width") - marginPeople.left - marginPeople.right;

const widthM = svgMap.node().getBoundingClientRect().width - marginMap.left - marginMap.right;
const heightM =  svgMap.attr("height") //Fait un carré (même hauteur que largeur)

const y = d3.scaleBand() 
var yAxis = (g, y) => g
  .attr("transform", `translate(${marginPeople.left},0)`)
  .call(d3.axisLeft(y).ticks(null, "s"))
  .call(g => g.select(".domain").remove()) //enlève la ligne verticale

const path = d3.geoPath();

function projection(data){

  const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229]) // Center on France
    .scale(500)
    .fitSize([widthM, heightM], data);

  path.projection(projection);
}

function handleMouseOver(d, i){
  //changes color on mouseOver
  d3.select(this)
    .style('fill', 'CornflowerBlue');

  d3.select('#dpt'+d.properties.code)
    .style('font-weight', 'bold')
    .text(d => d.properties.code);

  svgMap.append("text")
    .attr("id", "dpt" + d.properties.code + i)
    .attr("x", widthM - 250)
    .attr("y", 80)
    .text("Departement: " + d.properties.nom)
    .style("font-weight", "bold")

}

function handleMouseOut(d,i){
  //changes color back 
  d3.select(this)
    .style('fill', 'AntiqueWhite');

  d3.select('#dpt'+d.properties.code)
    .style('font-weight', 'normal')
    .text(d => d.properties.nom);

  d3.select("#dpt" + d.properties.code + i).remove();
  d3.select("#nb" + d.properties.code + i).remove();
} 

function handleClick(d,i){
  d3.select("#dptVIP").text(d.properties.nom)
  var html = "";
  var info = allData.filter(f => f.dpt == d.properties.code)

  //console.log(Array.from(info[0].roles))
  d3.entries(info[0].roles).forEach(d => {
    var pers = d3.entries(d.value.personnes)
    var noms = "";
    pers.forEach(p => {
      noms = noms + p.value.nom + "(" + p.value.value + ") "
    })



    html = html+`<p><b>${d.key}: </b> 
      ${noms}</p>`

  });

  d3.select("#dptInfo").html(html)
}

//add abstract map for locations not in mapFrance

function mapFrance(data){
  
  var mapView = svgMap.append("g")
    .attr("viewBox", [0, 0, widthM, heightM])
    .attr("class", "map")

  projection(data);


  mapView.selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("d", path) 
    .attr('fill', 'AntiqueWhite')
    .attr('stroke', 'white') 
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);


  var labels = mapView.append('g').attr('class', 'labels');

  labels.selectAll('.label')
    .data(data.features)
    .enter()
    .append('text')
      .attr("class", "label")
      .attr('transform', function(d) {
          return "translate(" + path.centroid(d) + ")";
      })
      .attr("id", (d => ("dpt"+d.properties.code)))
      .style('text-anchor', 'middle')
      .style('font-family', 'sans-serif')
      .text(d => d.properties.nom);

  mapView.selectAll('g').raise();

  
//zoom function 
  svgMap.call(
    d3.zoom().on(
      "zoom", 
      () => {
        mapView.attr('transform', d3.event.transform)
      }
    )
)

  return svgMap.node();

}


function addDpt(d){

  var heightP =  d.roles.size * 50; //pour chaque entrée de data, 50px
  const el = d3.select(this);

  var dptView = el.append("g")
  .attr("viewBox", [0, y(d.dpt), widthP, heightP])
  .attr("class", "dpt")

dptView 
  .append("text")
    .attr("y", 0)
    .attr("x", marginPeople.left)
    .text(d.dpt);

}

function showDptPeople(data){
  
  var height =  data.length * 50; //pour chaque entrée de data, 50px
  y.range([marginPeople.top, height-marginPeople.bottom])
    .domain(data.map(d => d.dpt))
    .padding(0.2)


  //bind data and add class "dpt"
  const dpt = svgPeople.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "dpt")

  dpt.each(addDpt)
  
  return svgPeople.node();

}

Promise.all([
  d3.json('../data/dptPersonnes.json'),
  d3.json('../data/departements-version-simplifiee.geojson')
]).then(([data, mapdata]) => {
  console.log(data)
  console.log(mapdata)
  //make a small map as selector

  allData = data;
  //for each dpt
  /*
  var num = 0;
  data.forEach(d => {
    showDptPeople(d, num)
    num += height;
  }*/
  mapFrance(mapdata);
  showDptPeople(data);
});
