const xmljs = require("xml-js");

function asRegExp(pattern){
    if( Array.isArray(pattern) ){
        return pattern.map(asRegExp);
    } else {
        if( pattern ){
            if( pattern instanceof RegExp ){
                return pattern;
            } else if( typeof pattern === "string" ){
                try{
                    return new RegExp(pattern.trim());
                }catch(err){
                }
            }
        }
        return '.';
    }
}

function extractXML( text, patterns, asJson ){
    
}

module.exports = extractXML;
