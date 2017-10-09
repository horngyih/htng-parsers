/* jshint esversion:6 */

const fs = require("fs");
const path = require("path");
const asserts = require("assert");

const ReadLine = require("readline");

const _PROJECT_DIR = path.resolve(__dirname,"..");
const _SRC_DIR = path.resolve(_PROJECT_DIR,"src");
const _SAMPLES_DIR = path.resolve(_PROJECT_DIR,"samples");

const LogFileCompactor = require(path.resolve(_SRC_DIR,"logFileCompactor"));
const Log4JEventParser = require(path.resolve(_SRC_DIR, "log4jEventParser"))

describe( "Test Log4j Event Parser", function(){
    var targetFile = path.resolve(_SAMPLES_DIR,"logfileCompactorSample.txt");
    it("- Check Test Sample File",function(done){
        fs.access(targetFile,done);
    });

    var log4jEventParser = new Log4JEventParser();
    var compactor = new LogFileCompactor();
    var parsedLines = null;
    var parsedEvents = null;
    var events = null;
    it("- Log4j Event Parser instantiated",function(){
        asserts(log4jEventParser);
    });

    it("- Parsed Lines from Sample File",function(done){
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetFile)});
        lineReader.on("line", compactor.parse);
        lineReader.on("close",done);
    });

    it("- Check compacted lines",function(){
        parsedLines = compactor.parsed();
        asserts(parsedLines);
    });

    it("- Parse Events from compacted lines",function(){
        parsedEvents = parsedLines.map(log4jEventParser.parse);
        asserts(parsedEvents);
    });

    it("- Parsed events contains expected number of events",function(){
        var expectedLines = parsedLines.reduce(function(count,line){ 
            count = count || 0;
            if( /^(INFO|DEBUG|ERROR|WARN)/.test(line)){
                count++;
            }
            return count;
        },0);
        asserts(parsedEvents.length === expectedLines);
    });
});