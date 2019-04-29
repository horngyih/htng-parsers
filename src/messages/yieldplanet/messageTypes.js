const setMultipleOccupancy = require("./setMultipleOccupancyRates");
const setMultipleOccupancyResponse = require("./setMultipleOccupancyRatesResponse");

let messageTypes = {
    SetMultipleOccupancyRates : {
        pattern : /<(SetMultipleOccupancyRates).*?>.*?<\/\1>/,
        parse : setMultipleOccupancy.parseSetMultipleOccupancyRates,
        flatten : setMultipleOccupancy.flattenSetMultipleOccupancyRates,
        formatters : setMultipleOccupancy.dataFormatters
    }
    ,
    SetMultipleOccupancyRatesResponse : {
        pattern : /<(SetMultipleOccupancyRatesResponse).*?>.*?<\/\1>/,
        parse : setMultipleOccupancyResponse.parse,
        flatten : setMultipleOccupancyResponse.parse,
        formatters : setMultipleOccupancy.dataFormatters
    }
//    ,
//    GetMultipleRatesRequestState : {
//        pattern : /<(GetMultipleRatesRequestState).*?>.*?<\/\1>/,
//        parse : i=>i,
//        flatten : i=>i
//    }
};

module.exports = messageTypes;
