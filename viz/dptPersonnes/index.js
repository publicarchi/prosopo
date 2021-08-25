var allData;

const svgMap = d3.select("#map")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)

  const svgExtraMap = d3.select("#extraMap")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)

 
const marginPeople = {top: 10, right: 10, bottom: 10, left: 10};
const marginMap = {top: 10, right: 10, bottom: 10, left: 10};
const marginExtraMap = {top: 40, right: 10, bottom: 40, left: 10};

const widthM = svgMap.node().getBoundingClientRect().width - marginMap.left - marginMap.right;
const heightM =  svgMap.attr("height") - marginMap.top - marginMap.bottom;

const widthEM = svgExtraMap.node().getBoundingClientRect().width - marginExtraMap.left - marginExtraMap.right;
const heightEM =  svgExtraMap.attr("height") - marginExtraMap.top - marginExtraMap.bottom;

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

  var label = d.properties ? d.properties.code : d;
  var name = d.properties ? d.properties.nom : d;

  //changes color on mouseOver
  d3.select(this)
    .style('fill', 'CornflowerBlue');

  d3.select('#dpt'+label)
    .style('font-weight', 'bold')

  var labelLocation =  widthM / 3 * 2;
  svgMap.append("text")
    .attr("id", "dpt" + label + i)
    .attr("x", labelLocation)
    .attr("y", marginMap.top)
    .text("Departement: " + name)
    .style("font-weight", "bold")

}

function handleMouseOut(d,i){

  var label = d.properties ? d.properties.code : d;
  //changes color back 
  d3.select(this)
    .style('fill', 'AntiqueWhite');

  d3.select('#dpt'+label)
    .style('font-weight', 'normal')

  d3.select("#dpt" + label + i).remove();
  d3.select("#nb" + label + i).remove();
} 

function handleClick(label, name){

  console.log(label)
  console.log(name)

  d3.select("#dptVIP").text(name)
  var html = "";
  var info = allData.filter(f => f.dpt == label)

  //console.log(Array.from(info[0].roles))
  d3.entries(info[0].roles).forEach(d => {
    var pers = d3.entries(d.value.personnes)
    var noms = "";
    pers.forEach(p => {
      noms = noms + p.value.nom + " (" + p.value.value + ") "
    })



    html = html+`<p><b>${d.key}: </b> 
      ${noms}</p>`

  });

  d3.select("#dptInfo").html(html)
}

//add abstract map for locations not in mapFrance

function mapFrance(data){
  
  var mapView = svgMap.append("g")
    .attr("viewBox", [marginMap.left, marginMap.top, widthM, heightM])
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
    .on("click", d => handleClick(d.properties.code, d.properties.nom));


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


function mapOtherLocations(data){

  var scale = heightEM / data.length;

  function getEMheight(d){
    var h = data.indexOf(d) * scale + marginExtraMap.top
    return h
  }


  var mapExtra = svgExtraMap.append("g")
    .attr("viewBox", [0, 0, widthEM, heightEM])
    .attr("class", "map")

 

  var places = mapExtra
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .style("fill", "AntiqueWhite")
    .attr("class", "dot")
    .attr("r", 10)
    .attr("cx", marginExtraMap.left)
    .attr("cy", d => getEMheight(d) - 4)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", d => handleClick(d, d));

  var labels = mapExtra.append('g').attr('class', 'labels');
  var lx = marginExtraMap.left + 15;


  labels.selectAll('.label')
  .data(data)
  .enter()
  .append('text')
    .attr("class", "label")
    .attr('transform', (d => "translate(" + lx + ","+ getEMheight(d) + ")"))
    .attr("id", (d => "dpt"+d))
    .style('text-anchor', 'start')
    .style('font-family', 'sans-serif')
    .text(d => d);

  

  return svgExtraMap.node();

}
function  handleMouseOverList (dpt){

}

function  handleMouseOverList (dpt){

}


function myListFilter() {
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  ul = document.getElementById("myUL");
  li = ul.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
      a = li[i];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
      } else {
          li[i].style.display = "none";
      }
  }
}


function dptSelector(loc){
  var list = ``;
  loc.forEach(l => {
    list = list + `<li class="listdpt">${l}</li>`
  })

  d3.select("#myUL").html(list)

  d3.selectAll(".listdpt")
    .on("click", function () {(this.textContent, this.textContent)})
    .on("mouseover", handleMouseOverList(this.textContent))
    .on("mouseout", handleMouseOutList(this.textContent));

}

Promise.all([
  d3.json('../data/dptPersonnes.json'),
  d3.json('../data/departements-version-simplifiee.geojson')
]).then(([data, mapdata]) => {
  //Attribute data to global var allData
  allData = data;

  //make a map 
  mapFrance(mapdata);

  
  //identify locations that are not in the map of France
  //  all locations in data
  var location = [];
  var allLocations = [];

  //liste des départements
  allData.forEach(d => location.push(d.dpt))
 

  //all other locations in map
  var mapLocations = new Set ();
  mapdata.features.forEach(f => {
    mapLocations.add(f.properties.code)
    allLocations.push({
      id: f.properties.code,
      nom: f.properties.nom
    })
  })

  var otherLocations = [];

  location.forEach(l => {
    if (!mapLocations.has(l)){
    //si la localisation n'est pas un département français sur la carte
      otherLocations.push(l)


      var name;
      if (l == "974")
        name = "La Réunion"
      else if (l == "00")
        name = "Sans numéro de département"
      else 
        name =f.properties.nom;

      allLocations.push({
        id: l,
        nom: name
      })
    }
  })
  /* Erreurs dans données: 
  - Meuse: Gigault d'Olincourt, va dans  55 
  - 00? à vérifier dans les données 
  */
  
//TODO: make special view for Paris and surroundings

  //add locations that are not in the map of France
  mapOtherLocations(otherLocations);

  //TODO: make a funciton to add names to locations 
  
   location.concat(otherLocations)
  dptSelector(allLocations);
});
