/* jshint esversion:6 */

const moment = require("moment");

const util = require("../utils/processingUtils");

function OTAHotelRatePlanNotifRQ(){
    this.messageContentCode = null;
    this.echoToken = null;
    this.timestamp = null;
    this.correlationID = null;
    this.ratePlans = [];
}


var dataFormatters = {
    messageContentCode : util.numberFormatter(),
    echoToken : util.stringFormatter(),
    timestamp : util.dateFormatter("YYYY-MM-DD HH:mm:ss.SSS"),
    correlationID : util.stringFormatter(),
    propertyCode : util.stringFormatter(),
    rate : util.stringFormatter(),
    roomType : util.stringFormatter(),
    currencyCode : util.stringFormatter(),
    startDate : util.dateFormatter("YYYY-MM-DD"),
    endDate : util.dateFormatter("YYYY-MM-DD"),
    single : util.numberFormatter(),
    double : util.numberFormatter(),
    triple : util.numberFormatter(),
    quad : util.numberFormatter()
};

function parseOTAHotelRatePlanNotifRQ(json){
    if( json ){
        var result = new OTAHotelRatePlanNotifRQ();    
        result = Object.assign(result, parse(json));
        return result;
    } else {
        return null;
    }
}

function flattenOTAHotelRatePlanNotifRQ(json){
    var otaHotelRatePlanNotif = null;
    if( json instanceof OTAHotelRatePlanNotifRQ ){
        otaHotelRatePlanNotif = json;
    } else {
        otaHotelRatePlanNotif = parseOTAHotelRatePlanNotifRQ(json);
    }

    if( otaHotelRatePlanNotif instanceof OTAHotelRatePlanNotifRQ ){
        return otaHotelRatePlanNotif.ratePlans.map(function(ratePlan){
            var flattened = {};
            flattened = Object.assign(flattened,otaHotelRatePlanNotif,ratePlan);
            delete flattened.ratePlans;
            return flattened;
        });
    }
}

function parse(json){
    var result = {};
    if(json){
        var root = getRootElement(json);
        result.propertyCode = getPropertyCode(json);
        if( root ){
            if( root._attributes ){
                var attributes = root._attributes;
                result.messageContentCode = attributes.MessageContentCode;
                result.echoToken = attributes.EchoToken;
                result.correlationID = attributes.CorrelationID;
                result.timestamp = (attributes.TimeStamp)?moment(attributes.TimeStamp):null;
            }

            var ratePlansElements = [];
            if( root.RatePlans ){
                ratePlansElements = ratePlansElements.concat(root.RatePlans);
            }
            var ratePlans = ratePlansElements.map(parseRatePlans).filter(util.filterEmpty).reduce(util.flatten,[]);
            result.ratePlans = ratePlans;
        }
    }
    return result;
}

function getPropertyCode(json){
    if( json ){
        var root = getRootElement(json);
        if( root && root.RatePlans && root.RatePlans._attributes){
            var attributes = root.RatePlans._attributes;
            return attributes.HotelCode;
        }
    } else {
        return null;
    }
}

function getRootElement(json){
    if(json){
        return json.OTA_HotelRatePlanNotifRQ;
    } else {
        return null;
    }
}

function parseRatePlans(ratePlans){
    if( ratePlans && ratePlans.RatePlan ){
        var ratePlanElements = [];
        ratePlanElements = ratePlanElements.concat(ratePlans.RatePlan);
        return ratePlanElements.map(parseRatePlan).filter(util.filterEmpty);
    } else {
        return null;
    }
}

function parseRatePlan(ratePlan){
    if( ratePlan && ratePlan.Rates ){
        var ratePlanCode = null;
        if( ratePlan._attributes ){
            ratePlanCode = ratePlan._attributes.RatePlanCode;
        }
        var ratesElements = [];
        ratesElements = ratesElements.concat(ratePlan.Rates);
        return ratesElements.map(function(rates){ return parseRates(rates, ratePlanCode);}).filter(util.filterEmpty);
    } else {
        return null;
    }
}

function parseRates(rates, ratePlanCode){
    if( rates && rates.Rate ){
        var rateElements = [];
        rateElements = rateElements.concat(rates.Rate);
        return rateElements.map(function(rate){ return parseRate(rate,ratePlanCode);}).filter(util.filterEmpty);
    } else {
        return null;
    }
}

function parseRate(rate, ratePlanCode){
    var result = {};
    if( rate && rate._attributes ){
        var attributes = rate._attributes;
        result.rate = ratePlanCode;
        result.roomType = attributes.InvTypeCode;
        result.currenyCode = attributes.CurrencyCode;
        result.startDate = (attributes.Start)?moment(attributes.Start,"YYYY-MM-DD"):null;
        result.endDate = (attributes.End)?moment(attributes.End,"YYYY-MM-DD"):null;
        if( rate.BaseByGuestAmts ){
            var baseGuestAmtList = [];
            baseGuestAmtList = baseGuestAmtList.concat(rate.BaseByGuestAmts.BaseByGuestAmt);
            var defaultOccupancies = {
                single : null,
                double : null,
                triple : null,
                quad : null
            };
            var occupancies = baseGuestAmtList.map(parseOccupancyRate).reduce(function(result,occupancy){
                result = result || {};
                if(occupancy){
                    result = Object.assign(result,occupancy);
                }
                return result;
            },{});
            result = Object.assign(result,defaultOccupancies,occupancies);
        }
    }
    return result;
}

function parseOccupancyRate(baseGuestAmount){
    if(baseGuestAmount && baseGuestAmount._attributes){
        var attributes = baseGuestAmount._attributes;
        var amountBeforeTax = attributes.AmountBeforeTax;
        if( attributes.AgeQualifyingCode === "10" ){
            //Adult Rates
            var occupancy = mapOccupancy(attributes.NumberOfGuests);
            if( occupancy ){
                var result = {};
                result[occupancy] = amountBeforeTax;
                return result;
            }
        } else if( attributes.AgeQualifyingCode === "8" ){
            //Child Rates
            if( amountBeforeTax ){
                return { child : amountBeforeTax };
            }
        }
    } else {
        return null;
    }
}

function mapOccupancy(numberOfGuests){
    if( numberOfGuests ){
        switch(numberOfGuests){
            case "1":
                return "single";
            case "2":
                return "double";
            case "3":
                return "triple";
            case "4":
                return "quad";
            default:
                return null;
        }
    } else {
        return null;
    }
}

module.exports = {
    OTAHotelRatePlanNotifRQ : OTAHotelRatePlanNotifRQ,
    parseOTAHotelRatePlanNotifRQ : parseOTAHotelRatePlanNotifRQ,
    flattenOTAHotelRatePlanNotifRQ : flattenOTAHotelRatePlanNotifRQ,
    dataFormatters : dataFormatters
};