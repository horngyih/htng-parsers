const fs = require("fs");
var jsonFileName = process.argv.slice(2)[0];

fs.readFile(jsonFileName, parseAsJson);

function parseAsJson(err, data){
    if( err ){
        console.log( err );
    } else {
        var json = JSON.parse(data.toString() );
        var flattened = json.map(mapOTAHotelRatePlanNotifRQ).reduce(flatten,[]).sort(compareRatePush());
        print(flattened);
    }
}

function print(rates){
    if( rates && rates.length > 0 ){
        var sample = rates[0];
        console.log(toHeader(sample));
        rates.forEach(function(ratePush){
            console.log(toLine(ratePush));
        });
        console.log(toHeader(sample));
    }
}

function toHeader(obj){
    var line = "";
    if( obj ){
        Object.keys(obj).forEach(function(key){
            line += key;
            line += " , ";
        });
    }
    return line;
}

function toLine(obj){
    var line = "";
    if( obj ){
        Object.keys(obj).forEach(function(key){
            line += obj[key] || "";
            line += " , ";
        });
    }
    return line;
}

function compareRatePush(keygen){
    keygen = keygen || function(target){
        var result = "";
        result = target.timestamp || "";
        result += target.ratePlanCode || "";
        result += target.roomTypeCode || "";
        result += target.startDate || "";
    };

    return function(a,b){
        var aKey = keygen(a);
        var bKey = keygen(b);
        if( aKey < bKey ){
            return -1;
        } else if( aKey === bKey ){
            return 0;
        } else {
            return 1;
        }
    }
}

function mapOTAHotelRatePlanNotifRQ(element){
    if( element ){
        if( element.OTA_HotelRatePlanNotifRQ ){
            var requestMessage = element.OTA_HotelRatePlanNotifRQ;
            var attributes = requestMessage._attributes || {};
            var ratePlans = requestMessage.RatePlans;
            var ratePlansAttr = ratePlans._attributes || {};
            var ratePlan = ratePlans.RatePlan;
            var rates = ratePlan.Rates.Rate;

            var flattenedRate = [];
            if( rates && rates.map ){
                flattenedRate = rates.map(flattenRate);
            }

            var timestamp = attributes.TimeStamp||null;
            var echoToken = attributes.EchoToken||null;
            var propertyCode = ratePlansAttr.HotelCode;
            var ratePlanCode = ratePlan._attributes.RatePlanCode;

            var results = [];
            if(flattenedRate){
                flattenedRate.forEach(function(rate){
                    var roomTypeCode = rate.roomTypeCode;
                    var startDate = rate.startDate;
                    var endDate = rate.endDate;
                    var single = rate.rates.single || null;
                    var double = rate.rates.double || null;
                    var triple = rate.rates.triple || null;
                    var quad = rate.rates.quad || null;
                    results.push({
                        timestamp,
                        echoToken,
                        propertyCode,
                        ratePlanCode,
                        roomTypeCode,
                        startDate,
                        endDate,
                        single,
                        double,
                        triple,
                        quad
                    });
                });
            }
            return results;
        }
    }
}

function flattenRate(rate){
    if( rate ){
        return {
            roomTypeCode : rate._attributes.InvTypeCode,
            startDate : rate._attributes.Start,
            endDate : rate._attributes.End,
            rates : (rate.BaseByGuestAmts.BaseByGuestAmt)?rate.BaseByGuestAmts.BaseByGuestAmt.reduce(flattenBaseRates,{}):{}
        };
    }
}

function flattenBaseRates(baseRate, baseRateAmounts){
    baseRate = baseRate || {
        single : null,
        double : null,
        triple : null,
        quad : null
    };
    var attr = baseRateAmounts._attributes||{};
    switch(baseRateAmounts._attributes.NumberOfGuests){
        case "1":
            baseRate.single = attr.AmountBeforeTax;
            break;
        case "2":
            baseRate.double = attr.AmountBeforeTax;
            break;
        case "3":
            baseRate.triple = attr.AmountBeforeTax;
            break;
        case "4":
            baseRate.quad = attr.AmountBeforeTax;
            break;
    }
    return baseRate;
}

function flatten(result, item){
    result = result || [];
    if( Array.isArray(item)){
        item.reduce(flatten,result);
    } else {
        result.push(item);
    }
    return result;
}