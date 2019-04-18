const availNotifRQ = require("./otaHotelAvailNotifRQ");
const ratePlanNotifRQ = require("./otaHotelRatePlanNotifRQ");

const messageTypes = {
    OTA_HotelAvailNotifRQ : {
        provider : availNotifRQ,
        flat : availNotifRQ.flattenOTAHotelAvailNotifRQ,
        parse : availNotifRQ.parseOTAHotelAvailNotifRQ,
        formatter : availNotifRQ.dataFormaters
    },
    OTA_HotelRatePlanNotifRQ : {
        provider : ratePlanNotifRQ,
        flat : ratePlanNotifRQ.flattenOTAHotelRatePlanNotifRQ,
        parse : ratePlanNotifRQ.parseOTAHotelRatePlanNotifRQ,
        formatter : ratePlanNotifRQ.dataFormatters
    }
}

module.exports = messageTypes;
