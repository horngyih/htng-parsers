/* jshint esversion:6 */

const xmljs = require("xml-js");

function extractXML(text, asJson ){
    var xmlRx = /<(OTA_\w+)\s?.*?><\/\1>/;
    if( text ){
        var xmlFound = xmlRx.exec(text);
        if( xmlFound ){
            if(asJson){
                var defaultOpts = {
                    alwaysArray: false
                };
                try{
                    if( typeof asJson === "object" ){
                        return xmljs.xml2js(xmlFound[0],Object.assign( {}, asJson, defaultOpts )) ;
                    } else {
                        return xmljs.xml2js(xmlFound[0],Object.assign({},{compact:true,spaces:2},defaultOpts));
                    }
                } catch( error ){
                    console.log( text );
                    console.log( error );
                    return text;
                }
            } else {
                return xmlFound[0];
            }
        }
    }
}

module.exports = extractXML;