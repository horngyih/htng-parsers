const parser = require("../src/parsers/saveProductAllocationParser");
const assert = require("assert");

describe("Test Save Product Allocations log parser", ()=>{
    let lines = [];
    beforeEach( done=>{
        parser.parse("./samples/localhost_access_log.2019-04-03.txt").then(l=>{
            lines = l;
            done();
        });
    });

    it("Should have parsed lines", ()=>{
        assert.ok(lines);
    });

    it("Should have the expected number of columns", ()=>{
        let columnSum = lines.reduce( (sum,line)=>{
            sum += line.length;
            return sum;
        }, 0);
        assert.equal(columnSum/lines.length,(21*lines.length)/lines.length);
    });

    it("Should have the expected number of rows", ()=>{
        assert.equal(lines.length, 113);
    });
});
