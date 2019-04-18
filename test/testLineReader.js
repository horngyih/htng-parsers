const assert = require("assert");
const { readFile } = require("../src/utils/lineReader");

describe("Test Line Reader utility", ()=>{
    let targetFile = "./samples/OTA_HotelAvailNotifRS.json";
    it("Should read the expected number of lines from the sample file", done=>{
        readFile(targetFile)
        .then(lines=>{
            assert(Array.isArray(lines));
            assert(12, lines.length);
            done();
        });
    });
});
