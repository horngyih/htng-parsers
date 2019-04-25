const {from} = require("rxjs");
const util = require("../utils/processingUtils");
const Log4JEventParser = require("../utils/log4JEventParser");
const { map, filter, take, mergeAll } = require("rxjs/operators");
const xmljs = require("xml-js");

const logParser = new Log4JEventParser();

function getMessagePatterns(messageTypes){
    if( typeof messageTypes === "object" ){
        return Object.keys(messageTypes).map(key=>new RegExp(messageTypes[key].pattern));
    } else {
        return [];
    }
}

function parseXMLPipe(messageTypes){
    if( messageTypes ){
        messagePatterns = getMessagePatterns(messageTypes);
        return [
            map(line=>logParser.parse(line)),
            map(log=>Object.assign({}, { timestamp : log.timestamp }, { message : (messagePatterns||[/./]).map(pattern=>log.data.match(pattern)).filter(i=>i) } ) ),
            filter(i=>i.message&&i.message.length>0),
            map(i=>Object.assign({}, { timestamp : i.timestamp }, { message : i.message[0] } ) ),
            map(i=>Object.assign({}, { timestamp : i.timestamp }, {type: i.message[1]}, {xml:JSON.parse(xmljs.xml2json(i.message[0],{compact:true}))})),
            map(i=>(messageTypes[i.type]||{flatten: i=>i}).flatten(i.xml, i.timestamp)),
            map(i=>from([].concat(i))),
            mergeAll()
        ];
    } else {
        return [ map(i=>i) ];
    }
}

function tabulateLine( formatters, fields, delimiter ){
    delimiter = (typeof delimiter === "string")? delimiter:"|";
    let result = [];
    if( formatters ){
        fields = (Array.isArray(fields))?fields: Object.keys(formatters);
        result.push(
            map(i=>fields.map(
                field=>{
                    formatter = formatters[field] || function(i){ return i };
                    return formatter(i[field]||null)
                })
            )
        );
    } else {
        result.push( map(i=>Object.keys(i).map(key=>i[key]||null) ) );
    }
    return result.concat( map(i=>[].concat(i).join(delimiter)) );
}

module.exports = {
    getMessagePatterns : getMessagePatterns,
    parseXMLPipe : parseXMLPipe,
    tabulateLine : tabulateLine
};
