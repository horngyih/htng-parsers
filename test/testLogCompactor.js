/*jshint esversion:6*/
const  path = require('path');
const fs = require("fs");
const ReadLine = require("readline");

const _PROJECT_DIR = path.resolve(__dirname,"..");
const _SRC_DIR = path.resolve(_PROJECT_DIR,"src");
const _SAMPLES_DIR = path.resolve( _PROJECT_DIR,"samples");

const LogFilePatterns = require(path.resolve(_SRC_DIR, "logFilePatterns" ));
const LogFileCompactor = require(path.resolve(_SRC_DIR,"logFileCompactor"));

var asserts = require('assert');

describe("Test Log Compactor", function(){
    var targetFile = path.resolve(_SAMPLES_DIR,"logfileCompactorSample.txt");
    var compactor = new LogFileCompactor();

    it("- Check Test Sample File",function(done){
        fs.access(targetFile,done);
    });

    it("- Log Compactor instantiated",function(){ asserts(compactor);});

    var parsedLines = null;
    it( "- Parsed Lines from Sample File",function(done){
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetFile)});
        lineReader.on("line", compactor.parse);
        lineReader.on("close",function(){
            parsedLines = compactor.parsed();
            done();
        });
    });

    it( "- Parsed data contains lines",function(){
        asserts(parsedLines);
    });
    
    it( "- Parsed data contains expected number of lines", function(){
        var expectedLines = 0;
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetFile)});
        lineReader.on("line",function(line){
            if(/^(INFO|WARN|ERROR|DEBUG)/.test(line) ){
                expectedLines++;
            }
        });
        lineReader.on("close",function(){
            asserts(parsedLines.length === expectedLines );
        });
    });
});
