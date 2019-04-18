const { fileLines } = require("../src/utils/lineReader");
const assert = require("assert");
const testFile = "./samples/linesTest.log";

describe("Test File Lines read as observable streams", ()=>{
    let fileStream = fileLines(testFile);
    let lineCount = 0;
    it("Should read lines from the file", done=>{
        fileStream.subscribe(
            l=>{
                assert(l);
                lineCount++
            },
            err=>console.log(err),
            ()=>{
                done();
            }
        );
    });

    it("Should read the expected number of lines from the file", ()=>{
        assert(5, lineCount);
    });
});
