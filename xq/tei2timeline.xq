declare namespace tei = 'http://www.tei-c.org/ns/1.0' ;
declare default element namespace 'http://www.tei-c.org/ns/1.0' ;
(:~
 : @rmq pour le moment le script ignore les autres affiliations qu’au Cbc
 : @rmq pour simplifier le fichier, on traite les dates comme certaines
 : :)

declare function local:getPerson($person) as item()* {
  map{ "type" : "Feature",
       "properties" : map{
         "name" : $person/persName[@full="yes"] => fn:normalize-space(),
         "id" : $person/@xml:id => fn:normalize-space()
       },
       "chronometry" : array{
         if ($person/birth/date) then map{
           "type" : "point",
           "label" : "date de naissance",
           "date" : local:getDate($person/birth/date, 'default')
         },
         if ($person/death/date) then map{
           "type" : "point",
           "label" : "date de décès",
           "date" : local:getDate($person/death/date, 'default')
         },
         if ($person/listEvent/event) 
         then for $event in $person/listEvent/event return map{
           "type" : "point",
           "label" : $event/label => fn:normalize-space(),
           "date" : local:getDate($event, 'default')
         },
         for $affiliation in $person/affiliation[orgName = "Conseil des bâtiments civils"] return map{
           "type" : "range",
           "label" : $affiliation/roleName => fn:normalize-space(),
           "start" : local:getDate($affiliation/date, "start"),
           "end" : local:getDate($affiliation/date, "end")
         }
       }
     }
};

(:~
 : This function return the date according to the attributes and date type
 : @param $date the dated element (tei:date or tei:event)
 : @param $type date type ('start', 'end', 'default')
 : @return a date string
 :)
declare function local:getDate($date as element(), $type) as xs:string {
  switch($date)
  case ($date[@when]) return local:getApproximateDate($date/@when)
  case ($date[@from][@to][$type="start"]) return local:getApproximateDate($date/@from)
  case ($date[@from][@to][$type="end"]) return local:getApproximateDate($date/@to)
  case ($date[@notBefore][@notAfter][$type="start"]) return local:getApproximateDate($date/@notBefore)
  case ($date[@notBefore][@notAfter][$type="start"]) return local:getApproximateDate($date/@notAfter)
  case ($date[@notBefore][@to][$type="start"]) return local:getApproximateDate($date/@notBefore)
  case ($date[@notBefore][@to][$type="end"]) return local:getApproximateDate($date/@to)
  case ($date[@notAfter][@from][$type="start"]) return local:getApproximateDate($date/@from)
  case ($date[@notAfter][@from][$type="end"]) return local:getApproximateDate($date/@notAfter)
  case ($date[@notBefore][@notAfter]) return local:getApproximateDate($date/@notBefore)
  case ($date[@from]) return local:getApproximateDate($date/@from)
  case ($date[@to]) return local:getApproximateDate($date/@to)
  case ($date[@notBefore]) return local:getApproximateDate($date/@notBefore)
  case ($date[@notAfter]) return local:getApproximateDate($date/@notAfter)
  default return "default"
};

(:~
 : This function return an approximate date for incomplete date
 : @param $date the date attribute
 : @return a three part date normalized string
 :)
declare function local:getApproximateDate($date) {
  let $regex := "(\d{4})-?(\d{2})?-?(\d{2})?"
  let $parts := fn:analyze-string($date, $regex)
  return if (not($parts//fn:group[2])) then $parts || "-01-01" 
  else if (not($parts//fn:group[3])) then $parts || "-01"
  else $date
};




let $prosopo := fn:doc("../cbc.tei.xml")
return json:serialize(map{
  "type": "FeatureCollection",
  "features": array{
    for $person in $prosopo//listPerson[@type="cbc"]/person
    return local:getPerson($person)
  }
})