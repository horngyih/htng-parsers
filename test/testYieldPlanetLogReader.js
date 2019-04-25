const fs = require("fs");
const rxjs = require("rxjs");
const {map, filter, take, partition} = require("rxjs/operators");
const {lineStreamReader} = require("../src/utils/lineReader");
const {compact} = require("../src/utils/compactor");
const messageUtils = require("../src/messages/messageUtils");

const ypMessages = require("../src/messages/yieldplanet/messageTypes");

compacted = compact( lineStreamReader(fs.createReadStream("./samples/integration-yieldplanet-soap.log.2")), "INFO" );
parsed = compacted.pipe( ...messageUtils.parseXMLPipe(ypMessages), filter(i=>i.type) );
messages = parsed.pipe( partition(i=>i.messageType==="SetRatePlan") );
ratePlanLines = messages[0].pipe( ...messageUtils.tabulateLine(ypMessages.SetMultipleOccupancyRates.formatters, ["timestamp", "messageType", "propertyCode", "ratePlan", "roomType", "startDate", "endDate", "single", "doubleRate", "triple", "quad" ] ) );
availabilityLines = messages[1].pipe( ...messageUtils.tabulateLine(ypMessages.SetMultipleOccupancyRates.formatters, ["timestamp", "messageType", "propertyCode", "ratePlan", "roomType", "startDate", "endDate", "bookingLimit", "xFreesell", "xArrival", "xTA", "xOrg" ] ) );

rxjs.merge(ratePlanLines, availabilityLines).subscribe(console.log);
