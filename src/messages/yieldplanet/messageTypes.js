const setMultipleOccupancy = require("./setMultipleOccupancyRates");

let messageTypes = {
    SetMultipleOccupancyRates : {
        pattern : /<(SetMultipleOccupancyRates).*?>.*?<\/\1>/,
        parse : setMultipleOccupancy.parseSetMultipleOccupancyRates,
        flatten : setMultipleOccupancy.flattenSetMultipleOccupancyRates,
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
