/* jshint esversion:6 */

const xmljs = require("xml-js");

function extractXML(text, asJson ){
    var xmlRx = /<(\w+)\s?.*?><\/\1>/;
    if( text ){
        var xmlFound = xmlRx.exec(text);
        if( xmlFound ){
            if(asJson){
                if( typeof asJson === "object" ){
                    return xmljs.xml2json(xmlFound[0],asJson);
                } else {
                    return xmljs.xml2json(xmlFound[0],{compact:true,spaces:2});
                }
            } else {
                return xmlFound[0];
            }
        }
    }
}

module.exports = extractXML;