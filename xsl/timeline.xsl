<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="3.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs"
    xmlns="http://www.w3.org/1999/xhtml" xpath-default-namespace="http://www.tei-c.org/ns/1.0">

    <xsl:output encoding="UTF-8" method="xml" omit-xml-declaration="no" indent="yes"/>

    <xsl:strip-space elements="*"/>

    <xsl:template match="/">
    </xsl:template>
   <!-- ajouter secr, psdt -->
    <!-- organisation -->
    <!--
   map{
   "persName" : "Gourlier, Charles-Pierre (1786-1857)",
   "forename" : "Charles-Pierre",
   "surname" : "Gourlier",
   "birth" : 1786-05-15, (: date approximative 1786-05, ou des intervales :)
   "death" : 1857-02-17,
   "lh" : 1837-06-14,
   "acad" : "",
   "affiliation" : [map{
       "role" : "rapporteur",
       "from" : 1819-05-24,
       "to" : 1838-04-15,
       "src" : "F21..."
    }
   -->
    
    <!-- copie à l’identique -->
    <xsl:template match="node() | @*">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>
