const assert = require("assert");
const path = require("path");

const ypMessages = require(path.join("..","src","messages","yieldplanet","messageTypes"));

describe("Test SetMultipleOccupancyRates prices message parser", ()=>{
    message = require(path.join("..","samples","setMultipleOccupancyRates-OccupancyPrices.json"));
    elements = ypMessages.SetMultipleOccupancyRates.flatten(message);
    it("Should have the expected number of occupancy price updates", ()=>{
        console.log(elements);
        assert.equal(18, elements.length);
    });
});

