<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="3.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs"
    xmlns="http://www.w3.org/1999/xhtml" xpath-default-namespace="http://www.tei-c.org/ns/1.0">

    <xsl:output encoding="UTF-8" method="xml" omit-xml-declaration="no" indent="yes"/>

    <xsl:variable name="filename" select="'index.html'"/>
    <xsl:strip-space elements="*"/>

    <xsl:template match="/">
        <xsl:result-document href="{$filename}">
            <html lang="fr" xml:lang="fr">
                <head>
                    <title>
                        <xsl:apply-templates select="/TEI/teiHeader/fileDesc/titleStmt/title"/>
                    </title>
                    <meta charset="utf-8"/>
                    <meta name="description"
                        content="Prosopographie des membres du Conseil des bâtiments civils par Emmanuel Château-Dutier"/>
                    <meta name="keywords" content="histoire de l’architecture, Conseil des bâtiments civils, prosopographie, biographie, dictionnaire" />
                    <meta name="robots" content="index, follow"/>
                    <meta name="DC.format" content="text/html"/>
                    <meta name="DC.title" content="Prosopographie du Conseil des bâtiments civils"/>
                    <meta name="DC.creator" content="Emmanuel Château-Dutier"/>
                    <link href="external.css" rel="stylesheet"/>
                    <script src="external.js"/>
                </head>
                <body>
                    <nav>
                        <ul>
                            <li><a href="#rep">Répertoire</a></li>
                            <li><a href="#chrono">Chronologie</a></li>
                            <li><a href="#credits">Crédits</a></li>
                        </ul>
                    </nav>
                    <main>
                        <h1>Prosopographie du Conseil des bâtiments civils</h1>
                        <section id="rep">
                            <h2>Répertoire prosopographique</h2>
                            <xsl:apply-templates select="TEI/text/body/listPerson[@type='cbc']"/>
                        </section>
                        <section id="chrono">
                            <h2>Chronologie</h2>
                            <xsl:apply-templates select="TEI/text/body/listPerson[@type='cbc']" mode="chrono"
                            />
                        </section>
                    </main>
                    <footer id="credits">
                        <p>Emmanuel Château-Dutier</p>
                        <p>Cette œuvre est mise à disposition selon les termes de la licence <a href="http://creativecommons.org/licenses/by-sa/4.0/" >Creative Commons Attribution - Partage dans les Mêmes Conditions 4.0 International (CC BY-SA 4.0)</a>.</p>
                    </footer>
                </body>
            </html>
        </xsl:result-document>
    </xsl:template>

    <xsl:template match="person" mode="chrono">
        <xsl:text>[</xsl:text>
        <xsl:copy-of select="persName[@full = 'yes']/text()"/>
        <xsl:text>, </xsl:text>
        <xsl:value-of select="birth/date/@when"/>
        <xsl:text>, </xsl:text>
        <xsl:value-of select="death/date/@when"/>
        <xsl:text>]</xsl:text>
    </xsl:template>

    <xsl:template match="teiHeader"/>
    <xsl:template match="head"/>
    <xsl:template match="listPerson">
        <xsl:apply-templates />
    </xsl:template>
    <xsl:template match="persName"></xsl:template>
    
    <xsl:template match="person">
        <article>
            <xsl:apply-templates />
        </article>
    </xsl:template>
    
    <xsl:template match="person/persName[@full='yes']">
        <span class="name">
            <xsl:apply-templates />
        </span>
    </xsl:template>
    
    <xsl:template match="birth">
        <xsl:choose>
            <xsl:when test="./date">
                <xsl:text>Né le </xsl:text>
                <xsl:apply-templates select="./date"/>
            </xsl:when>
            <xsl:otherwise><xsl:apply-templates /></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="titleStmt/title">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="title">
        <span class="title">
            <xsl:apply-templates/>
        </span>
    </xsl:template>

    <!-- inline elements -->

    <xsl:template match="hi">
        <pre>
            <xsl:apply-templates/>
        </pre>
    </xsl:template>

    <xsl:template match="hi[@rend = 'bold']">
        <strong>
            <xsl:apply-templates/>
        </strong>
    </xsl:template>

    <xsl:template match="hi[@rend = 'italic']">
        <emph>
            <xsl:apply-templates/>
        </emph>
    </xsl:template>

    <xsl:template match="hi[@rend = 'superscript']">
        <sup>
            <xsl:apply-templates/>
        </sup>
    </xsl:template>

    <xsl:template match="q">
        <q>
            <xsl:apply-templates/>
        </q>
    </xsl:template>
    
    <!-- copie à l’identique -->
    <xsl:template match="node() | @*">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>
