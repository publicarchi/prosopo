
const fs = require('fs-extra');

const conbavil = JSON.parse(fs.readFileSync('/Users/lena/Documents/atlasNumerique/data/conbavil.json', {encoding: 'utf8'}));
//var france = JSON.parse(fs.readFileSync('./data/departements-version-simplifiee.geojson', {encoding: 'utf8'}))

var indexDpt = {};


//add regex to separate multiple entries
//add unsure for attribution of role in multiple entities
//add regex and unsure to remove []


function addPerson(dpt, role, name){
    //si le dpt n'est pas encore dans l'index, créer une entrée
    //utilise le num de département
    if (!(dpt in indexDpt))
        indexDpt[dpt] = {
            roles: {}
        };
    
    //si le rôle n'est pas encore dans l'index, créer une entrée
    if (!(role in indexDpt[dpt].roles))
        indexDpt[dpt].roles[role] = {
            personnes: {}
        }
    
    //si le nom n'est pas encore dans l'index, créer une entrée
    if (!(name in indexDpt[dpt].roles[role].personnes))    
        indexDpt[dpt].roles[role].personnes[name]={
            nom: name, 
            value: 0
        }
    

    indexDpt[dpt].roles[role].personnes[name].value += 1;

}

conbavil.forEach(delib => {
    if (delib.participants && delib.participants.length > 0){
        delib.participants.forEach(p=> {
            var role = p.occupation;
            //on pourrait/devrait splitter par role..
            
            p.persName.split(/\s*;\s*/).map(name => { 
                //pour chaque nom contenu dans les participants
                if (delib.numDepartement && delib.numDepartement.length){
                    //pour chaque département français associé à la délibération
                    delib.numDepartement.split(/\s*;\s*/).map(dpt => addPerson(dpt, role, name))

                } else if (delib.region = "étranger" && delib.departement && delib.departement.length){
                    //pour chaque "département" à l'étranger associé à la délibération
                    delib.departement.split(/\s*;\s*/).map(dpt => addPerson(dpt, role, name))
                } else {
                    var dpt = "00"    
                    // créer un feature pour les affaires sans num de département, département fictif 00
                    addPerson(dpt, role, name)
                }
            });    
        });    

    }
   
});

var arrayData = [];

for (i in indexDpt){
    arrayData.push({ 
      dpt: i,
      roles: indexDpt[i].roles
    })
    
}

fs.writeJSONSync('./data/dptPersonnes.json', arrayData, {spaces: 2, encoding: 'utf8'});





                