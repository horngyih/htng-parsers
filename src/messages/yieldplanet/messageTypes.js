const setMultipleOccupancy = require("./setMultipleOccupancyRates");

let messageTypes = {
    SetMultipleOccupancyRates : {
        pattern : /<(SetMultipleOccupancyRates).*?>.*?<\/\1>/,
        parse : setMultipleOccupancy.parseSetMultipleOccupancyRates,
        flatten : setMultipleOccupancy.flattenSetMultipleOccupancyRates
    },
    GetMultipleRatesRequestState : {
        pattern : /<(GetMultipleRatesRequestState).*?>.*?<\/\1>/
    }
};

module.exports = messageTypes;
