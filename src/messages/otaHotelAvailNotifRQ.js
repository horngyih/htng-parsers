/* jshint esversion:6 */

const moment = require("moment");

const util = require("../utils/processingUtils");

function OTAHotelAvailNotifRQ(){
    this.messageContentCode = null;
    this.echoToken = null;
    this.timestamp = null;
    this.correlationID = null;
    this.propertyCode = null;
    this.availabilityStatusMessages = [];
}

function parseOTAHotelAvailNotifRQ(json){
    var result = new OTAHotelAvailNotifRQ();
    result = Object.assign(result, parse(json));
    return result;
}

function flattenOTAHotelAvailNotifRQ(json){
    var otaHotelAvailNotifRQ = null;
    if( json instanceof OTAHotelAvailNotifRQ ){
        otaHotelAvailNotifRQ = json;
    } else {
        otaHotelAvailNotifRQ = parseOTAHotelAvailNotifRQ(json);
    }

    if( otaHotelAvailNotifRQ instanceof OTAHotelAvailNotifRQ ){
        return otaHotelAvailNotifRQ.availabilityStatusMessages.map(function(availStatusMessage){
            var flattened = {};
            flattened = Object.assign(otaHotelAvailNotifRQ,availStatusMessage);
            delete flattened.availabilityStatusMessages;
            return flattened;
        });
    } else {
        return otaHotelAvailNotifRQ;
    }
}

function parse(json){
    var result = {};
    var rootElement = getRootElement(json);
    if( rootElement ){
        var attributes = rootElement._attributes;
        result = {
            messageContentCode : attributes.MessageContentCode || null,
            echoToken : attributes.EchoToken || null,
            timestamp : (attributes.TimeStamp)? moment(attributes.TimeStamp):null,
            correlationID : attributes.CorrelationID || null
        };

        if( rootElement.AvailStatusMessages ){
            var availStatusMessagesBase = rootElement.AvailStatusMessages;
            if( Array.isArray(availStatusMessagesBase) && availStatusMessagesBase.length > 0 ){
                availStatusMessagesBase = availStatusMessagesBase[0];
            }
            result.propertyCode = availStatusMessagesBase._attributes.HotelCode;

            var statusMessages = [].concat(rootElement.AvailStatusMessages);
            result.availabilityStatusMessages = statusMessages.map(parseAvailStatusMessages).reduce(util.flatten,[]);
        }
    }
    return result;
}

function parseAvailStatusMessages(availStatusMessages){
    if( availStatusMessages ){
        var list = [];
        list = list.concat(availStatusMessages.AvailStatusMessage);
        return list.map(parseStatusMessage);
    }
}

function parseStatusMessage(availStatusMessage){
    if(availStatusMessage){
        var result = {};
        var attributes = availStatusMessage._attributes;
        if( attributes ){
            result.bookingLimit = attributes.BookingLimit;
            result.bookingLimitMessageType = attributes.BookingLimitMessageType;
        }

        var statusApplicationControl = availStatusMessage.StatusApplicationControl;
        if( statusApplicationControl && statusApplicationControl._attributes ){
            var statusAttributes = statusApplicationControl._attributes;
            result.startDate = (statusAttributes.Start)?moment(statusAttributes.Start, "YYYY-MM-DD"):null;
            result.endDate = (statusAttributes.End)?moment(statusAttributes.End, "YYYY-MM-DD"):null;
            result.ratePlan = statusAttributes.RatePlanCode || null;
            result.roomType = statusAttributes.InvTypeCode || null;
        }

        var restrictionControl = availStatusMessage.RestrictionStatus;
        var controlFlags = {
            xFreesell : null,
            xArrival : null,
            xDeparture : null,
            xTA : null,
            xOrg : null                
        };
        if( restrictionControl && restrictionControl._attributes ){
            var controlAttributes = restrictionControl._attributes;
            var control = mapRestriction(controlAttributes.Restriction);
            var state = mapStatus(controlAttributes.Status);
            if( control ){
                var controlStatus = {};
                controlStatus[control] = state;
                controlFlags = Object.assign(controlFlags, controlStatus );
            }
        }
        result = Object.assign(result, controlFlags );
        return result;
    }
}

function mapStatus(status){
    if("Open"===status){
        return false;
    } else if( "Close"===status){
        return true;
    } else{
        return null;
    }
}

function mapRestriction(restriction){
    if(restriction){
        switch(restriction){
            case "Master":
                return "xFreesell";
            case "Arrival":
                return "xArrival";
            case "Departure":
                return "xDeparture";
            case "TravelAgent":
                return "xTA";
            case "Organization":
                return "xOrg";
            default:
                return null;
        }
    } else {
        return null;
    }
}

function getRootElement(json){
    if(json){
        return json.OTA_HotelAvailNotifRQ;
    } else {
        return null;
    }
}


module.exports = {
    OTAHotelAvailNotifRQ : OTAHotelAvailNotifRQ,
    parseOTAHotelAvailNotifRQ : parseOTAHotelAvailNotifRQ,
    flattenOTAHotelAvailNotifRQ : flattenOTAHotelAvailNotifRQ
};