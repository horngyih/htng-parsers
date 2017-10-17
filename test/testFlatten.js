/* jshint esversion: 6 */

const path = require("path");
const assert = require("assert");

const _PROJECT_DIR = path.resolve(__dirname,"..");
const _SRC_DIR = path.resolve(_PROJECT_DIR,"src");

const util = require(path.resolve(_SRC_DIR, "utils", "processingUtils"));

describe( "Test Flatten Reduction",function(){
    var test = [ 'a', 'b', [ 'c', 'd' ], 'd', [ ['a', 'b'], [ 'd', 'd'] ] ];
    it("Should return a flattened array", function(){
        var result = test.reduce(util.flatten,[]);
        assert(result.length === 9 );
    });
});