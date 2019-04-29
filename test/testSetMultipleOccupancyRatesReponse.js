const path = require("path");
const assert = require("assert");
const ypMessages = require(path.join("..","src","messages","yieldplanet","messageTypes"));

const message = require(path.join("..","samples","setMultipleOccupancyRatesResponse.json"));

describe( "Test parse SetMultipleOccupancyRatesResponse", ()=>{
    console.log(ypMessages.SetMultipleOccupancyRatesResponse.parse(message));
    let parsed = ypMessages.SetMultipleOccupancyRatesResponse.parse(message);
    it("Should parse the message", ()=>{
        assert( parsed );
    });
    it("Should parse message the expected Success state", ()=>{
        assert( parsed.success === true );        
    });

    it("Should parse the expected RequestId", ()=>{
        assert.equal( "103498981", parsed.requestID );
    });

    it("Should parse the expected ErrorId", ()=>{
        assert.equal( "0", parsed.errorID );
    });

    it("Should parse the expected Timestamp", ()=>{
        assert.equal( "2019-04-22 12:17:00.994", ypMessages.SetMultipleOccupancyRatesResponse.formatters.timestamp(parsed.timestamp));
    });
});
