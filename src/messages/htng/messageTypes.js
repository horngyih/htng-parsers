const availNotifRQ = require("./otaHotelAvailNotifRQ");
const ratePlanNotifRQ = require("./otaHotelRatePlanNotifRQ");

const messageTypes = {
    OTA_HotelAvailNotifRQ : {
        pattern : '<(OTA_HotelAvailNotifRQ)\\s?.*?><\/\\1>',
        provider : availNotifRQ,
        flat : availNotifRQ.flattenOTAHotelAvailNotifRQ,
        parse : availNotifRQ.parseOTAHotelAvailNotifRQ,
        formatter : availNotifRQ.dataFormaters
    },
    OTA_HotelRatePlanNotifRQ : {
        pattern : '<(OTA_HoteliRatePlanNotifRQ)\\s?.*?><\/\\1>',
        provider : ratePlanNotifRQ,
        flat : ratePlanNotifRQ.flattenOTAHotelRatePlanNotifRQ,
        parse : ratePlanNotifRQ.parseOTAHotelRatePlanNotifRQ,
        formatter : ratePlanNotifRQ.dataFormatters
    }
}

module.exports = messageTypes;
