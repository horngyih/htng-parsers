/* jshint esversion:6 */

const path = require("path");
const moment = require("moment");
const util = require(path.join("..","..","utils","processingUtils"));

function SetMultipleOccupancyRates(timestamp){
    this.type = "SetMultipleOccupancyRates";
    this.timestamp = timestamp;
    this.propertyCode = null;
}

let dataFormatters = {
    type : util.stringFormatter(),
    messageType : util.stringFormatter(),
    timestamp : util.dateFormatter("YYYY-MM-DD HH:mm:ss.SSS"),
    propertyCode : util.stringFormatter(),
    startDate : util.dateFormatter("YYYY-MM-DD"),
    endDate : util.dateFormatter("YYYY-MM-DD"),
    ratePlan : util.stringFormatter(),
    roomType : util.stringFormatter(),
    bookingLimit : util.numberFormatter(),
    bookingLimitMessageType : util.stringFormatter(),
    xFreesell : util.booleanFormatter(),
    xArrival : util.booleanFormatter(),
    xTA : util.booleanFormatter(),
    xOrg : util.booleanFormatter(),
    single : util.numberFormatter(),
    doubleRate : util.numberFormatter(),
    triple : util.numberFormatter(),
    quad : util.numberFormatter()
};

function parseSetMultipleOccupancyRates(json, timestamp ){
    let result = new SetMultipleOccupancyRates(timestamp);
    result = Object.assign( result, parse(json));
    return result;
}

function flattenSetMultipleOccupancyRates(json, timestamp ){
    let setMultipleOccupancyRates = null;
    if( json instanceof SetMultipleOccupancyRates ){
        setMultipleOccupancyRates = json;
    } else {
        setMultipleOccupancyRates = parseSetMultipleOccupancyRates(json, timestamp );
    }

    if( setMultipleOccupancyRates instanceof SetMultipleOccupancyRates ){
        return [].concat(setMultipleOccupancyRates.setOccupancyRateUnits).map(item=>Object.assign({}, item, {timestamp : setMultipleOccupancyRates.timestamp}));
    }
}

function parse(json){
    let result = {};
    let rootElement = getRootElement(json);
    if( rootElement ){
        let occupancyRateUnits = rootElement.request.Rates.SetOccupancyRateUnit;
        result.setOccupancyRateUnits = [].concat(([].concat(occupancyRateUnits)).map(parseOccupancyRateUnits));
    }
    return result;
}

function parseOccupancyRateUnits(occupancyRateUnit){
    let result = Object.assign(
        {},
        { propertyCode : getHotelId(occupancyRateUnit) },
        { roomType : getRoomId(occupancyRateUnit) },
        { ratePlan : getRatePlanId(occupancyRateUnit) },
        { startDate : getDateFrom(occupancyRateUnit) },
        { endDate : getDateTill(occupancyRateUnit) }
    );

    let occupancyPrices = getOccupancyPrices(occupancyRateUnit);
    if( occupancyPrices ){
        result = Object.assign({}, result, occupancyPrices, { messageType : "SetRatePlan" } );
    } else {
        result = Object.assign({},
            result,
            { bookingLimit : getAllotment(occupancyRateUnit) },
            { xFreesell : getCloseOut(occupancyRateUnit) === "true" },
            { xArrival : getCloseToArrival(occupancyRateUnit) === "true" },
            { xDeparture : null === "true" },
            { xTA : null === "true" },
            { xOrg : null === "true" },
            { messageType : "SetAvailabilityControl" }
        );
    }
    return Object.assign({}, {type:"SetMultipleOccupancyRates"}, result );
}

function flattenOccupancyPrices(occupancyPrices){
    if( occupancyPrices ){
        let arr = [].append(occupancyPrices);
        let reduction = arr.reduce(
            (map,op)=>{
                map = map || {};
                map[op.occupancy] = op.price;
                return map;
            },
            {}
        );

        return Object.assign(
            {},
            { single : reduction["1"]||null },
            { doubleRate : reduction["2"]||null },
            { triple : reduction["3"]||null },
            { quad : reduction["4"]||null }
        );
    }
    return null;
}

function getOccupancyPrices(occupancyRateUnit){
    if( occupancyRateUnit && occupancyRateUnit.OccupancyPrices ){
        if( Array.isArray( occupancyRateUnit.OccupancyPrices.OccupancyPrice ) ){
            let occupancyPrices = occupancyRateUnit.OccupancyPrices.OccupancyPrice.map(
                occupancy=>{
                    return Object.assign(
                        {},
                        { occupancy : getOccupancy(occupancy) },
                        { price : getPrice(occupancy) }
                    );
                }
            );

            let reduction = occupancyPrices.reduce( (map,occupancyPrice)=>{
                map = map || {};
                map[occupancyPrice.occupancy] = occupancyPrice.price;
                return map;
            }, {});

            return Object.assign(
                {},
                { single : reduction["1"]||null },
                { doubleRate : reduction["2"]||null },
                { triple : reduction["3"]||null },
                { quad : reduction["4"]||null }
            );
        }
    }
    return null;
}

function getOccupancy(occupancyPrice){
    if( occupancyPrice ){
        if( occupancyPrice.Occupancy ){
            return extractText(occupancyPrice.Occupancy);
        }
    }
    return null;
}

function getPrice(occupancyPrice){
    if( occupancyPrice ){
        if( occupancyPrice.Price ){
            return extractText(occupancyPrice.Price);
        }
    }
    return null;
}

function getHotelId(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.HotelId ){
            return extractText(occupancyRateUnit.HotelId);
        }
    }
    return null;
}

function getRoomId(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.RoomId ){
            return extractText(occupancyRateUnit.RoomId);
        }
    }
    return null;
}

function getRatePlanId(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.RatePlanId ){
            return extractText(occupancyRateUnit.RatePlanId);
        }
    }
    return null;
}

function getDateFrom(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.DateFrom ){
            return moment(extractText(occupancyRateUnit.DateFrom));
        }
    }
    return null;
}

function getDateTill(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.DateTill ){
            return moment(extractText(occupancyRateUnit.DateTill));
        }
    }
    return null;
}

function getCloseOut(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.CloseOut ){
            return extractText(occupancyRateUnit.CloseOut);
        }
    }
    return null;
}

function getAllotment(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.Allotment ){
            return extractText(occupancyRateUnit.Allotment);
        }
    }
    return null;
}

function getCloseToArrival(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.CloseToArrival ){
            return extractText(occupancyRateUnit.CloseToArrival);
        }
    }
    return null;
}

function getMinLOS(occupancyRateUnit){
    if( occupancyRateUnit ){
        if( occupancyRateUnit.MinNightStay ){
            return extractText(occupancyRateUnit.MinNightStay);
        }
    }
    return null;
}

function extractText(element){
    if( element ){
        if( element._text ){
            return element._text;
        }
    }
    return null;
}

function getRootElement(json){
    if(typeof json === "object"){
        return json.SetMultipleOccupancyRates;
    } else {
        return null;
    }
}

module.exports = {
    SetMultipleOccupancyRates : SetMultipleOccupancyRates,
    parseSetMultipleOccupancyRates : parseSetMultipleOccupancyRates,
    flattenSetMultipleOccupancyRates : flattenSetMultipleOccupancyRates,
    dataFormatters : dataFormatters,
}
