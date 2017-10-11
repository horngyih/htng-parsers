/* jshint esversion:6 */

function extractXML(text){
    var xmlRx = /<(\w+)\s?.*?><\/\1>/;
    if( text ){
        var xmlFound = xmlRx.exec(text);
        if( xmlFound ){
            return xmlFound[0];
        }
    }
}

module.exports = extractXML;