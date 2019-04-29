/* jshint esversion:6 */

const path = require("path");
const moment = require("moment");
const util = require(path.join("..","..","utils","processingUtils"));

function SetMultipleOccupancyRatesResponse( timestamp ){
    this.timestamp = timestamp;
    this.success = null;
    this.requestID = null;
}

let dataFormatters = {
    timestamp : util.dateFormatter("YYYY-MM-DD HH:mm:ss.SSS"),
    success : util.stringFormatter(),
    requestID : util.stringFormatter(),
    errorID : util.stringFormatter()
};

function getRootElement(json){
    if( typeof json === "object"){
        return json.SetMultipleOccupancyRatesResponse;
    }
    return null;
}

function parse(json){
    let element = getRootElement(json);
    let result = new SetMultipleOccupancyRatesResponse(getTimestamp(element));
    result.success = getSuccess(element);
    result.requestID = getRequestId(getResult(element));
    result.errorID = getErrorId(element);

    result = Object.assign( {},
        {type: "SetMultipleOccupancyRatesResponse"},
        {messageType:"SetMultipleOccupancyRatesResponse"},
        {success : getSuccess(element)},
        {requestID : getRequestId(getResult(element))},
        {errorID : getErrorId(element)}
    );
    return result;
}
function getResult(element){
    if( element){
        return element.SetMultipleOccupancyRatesResult;
    }
    return null;
}

function getRequestId(element){
    if( element ){
        return getText(element.RequestId);
    }
    return null;
}

function getStatus(element){
    let result = getResult(element);
    if( result ){
        return result.Status;
    }
    return null;
}

function getSuccess(element){
    let status = getStatus(element);
    if( status ){
        return getText(status.Success) === "true";
    }
    return null;
}

function getTimestamp(element){
    let status = getStatus(element);
    if( status ){
        let timestampText =getText(status.TimeStamp);
        return (timestampText)?moment(timestampText):null;
    }
    return null;
}

function getErrorId(element){
    let status = getStatus(element);
    if( status ){
        return getText(status.ErrorId);
    }
    return null;
}

function getText(element){
    if( element && element._text ){
        return element._text;
    }
    return null;
}

module.exports = {
    SetMultipleOccupancyRatesResponse : SetMultipleOccupancyRatesResponse,
    parse : parse,
    flatten : parse
}
