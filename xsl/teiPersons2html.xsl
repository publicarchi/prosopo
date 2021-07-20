<?xml version="1.0" encoding="UTF-8"?>
<!--
    This XSL transforms a TEI listPerson to HTML5
    @author emchateau
    @since 2018-08-30
    @version 0.1
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
  xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs"
  xmlns="http://www.w3.org/1999/xhtml" xpath-default-namespace="http://www.tei-c.org/ns/1.0">
    <xsl:output method="html" indent="yes" encoding="UTF-8" html-version="5.0"/>
    <xsl:strip-space elements="*"/>
    
    <xsl:variable name="path" select="'person'"/>
    
    <xsl:template match="/TEI">
        <xsl:apply-templates />
    </xsl:template>
    
    <xsl:template match="person[@xml:id]">
        <xsl:variable name="id" select="./@xml:id"/>
        <xsl:result-document href="{$path }/{$id}.html">
            <xsl:apply-templates/>
        </xsl:result-document>
    </xsl:template>
    
    <xsl:template match="person">
        <html>
            <head>
                <meta charset='utf-8' />
                <meta http-equiv="content-type" content="text/html" />
                <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0' />
                <title><xsl:value-of select="persName[@full='yes']"/></title>
                <link href="css/normalize.css" rel="stylesheet" />
                <link href="css/main.css" rel="stylesheet" />
            </head>
            <body>
                <header>
                    <h1><xsl:value-of select="persName[@full='yes']"/></h1>
                    <p></p>
                </header>
            </body>
        </html>
    </xsl:template>
    
    <xsl:template match="teiHeader">
        <html>
            <head>
                <meta charset='utf-8' />
                <meta http-equiv="content-type" content="text/html" />
                <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0' />
                <title>
                    <xsl:for-each select="fileDesc/titleStmt/title">
                        <xsl:apply-templates/>
                        <xsl:if test="position()!=last()">
                            <xsl:text>, </xsl:text>
                        </xsl:if>
                    </xsl:for-each></title>
                <link href="css/normalize.css" rel="stylesheet" />
                <link href="css/main.css" rel="stylesheet" />
            </head>
            <body>
                
            </body>
        </html>
    </xsl:template>
    
    <!-- Copie à l'identique du fichier (toutes les passes) -->
    <xsl:template match="node() | @*" mode="#all">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    
</xsl:stylesheet>
