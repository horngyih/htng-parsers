const assert = require("assert");
const path = require("path");

const setMultipleOccupancyRates = require(path.join("..","src","messages","yieldplanet","setMultipleOccupancyRates"));
let formatters = setMultipleOccupancyRates.dataFormatters;

describe("Test SetMultipleOccupancyRates availability message parser", ()=>{
    message = require(path.join("..","samples","setMultipleOccupancyRates.json"));
    elements = setMultipleOccupancyRates.flattenSetMultipleOccupancyRates(message);
    it("Should parse the expected number of SetOccupancyRateUnits", ()=>{
        assert(3, elements.length);
    });

    let propertyCode = 8118;
    let roomType = 75976;
    let ratePlan = 61795;

    it("Should parse the expected details for the elements", ()=>{
        function checkCommon(element){
            assert.equal(propertyCode, element.propertyCode);
            assert.equal(roomType, element.roomType);
            assert.equal(ratePlan, element.ratePlan);
            assert.equal("true", formatters.xFreesell(element.xFreesell));
            assert.equal("true", formatters.xArrival(element.xArrival));
         }

        let firstElement = elements[0];
        checkCommon(firstElement);
        assert.equal("2019-04-23", formatters.startDate(firstElement.startDate));
        assert.equal("2019-04-23", formatters.endDate(firstElement.endDate));

        let secondElement = elements[1];
        checkCommon(secondElement);
        assert.equal("2019-04-24", formatters.startDate(secondElement.startDate));
        assert.equal("2019-04-24", formatters.endDate(secondElement.endDate));

        let thirdElement = elements[2];
        checkCommon(thirdElement);
        assert.equal("2019-04-25", formatters.startDate(thirdElement.startDate));
        assert.equal("2019-04-25", formatters.endDate(thirdElement.endDate));
    });
});

describe("Test SetMultipleOccupancyRates price message parser", ()=>{
    message = require(path.join("..","samples","setMultipleOccupancyRates-OccupancyPrices.json"));
    elements = setMultipleOccupancyRates.flattenSetMultipleOccupancyRates(message);
    console.log(elements);
});
