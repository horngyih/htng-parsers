/*jshint esversion:6*/
const  path = require('path');
const fs = require("fs");
const ReadLine = require("readline");

const _PROJECT_DIR = path.resolve(__dirname,"..");
const _SRC_DIR = path.resolve(_PROJECT_DIR,"src");
const _SAMPLES_DIR = path.resolve( _PROJECT_DIR,"samples");

const LogFilePatterns = require(path.resolve(_SRC_DIR,"utils","logFilePatterns" ));
const LogFileCompactor = require(path.resolve(_SRC_DIR,"utils","logFileCompactor"));

var asserts = require('assert');

describe("Test Log Compactor", function(){
    var targetFile = path.resolve(_SAMPLES_DIR,"logfileCompactorSample.txt");
    var compactor = new LogFileCompactor();

    it("Should have a valid Test Sample File",function(done){
        fs.access(targetFile,done);
    });

    it("Should have a Log Compactor instantiated",function(){ asserts(compactor);});

    var parsedLines = null;
    it( "Should parse Lines from Sample File",function(done){
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetFile)});
        lineReader.on("line", compactor.parse);
        lineReader.on("close",function(){
            parsedLines = compactor.parsed();
            asserts(parsedLines);
            done();
        });
    });

    it( "Should have parsed data that contains lines",function(){
        asserts(parsedLines);
    });
    
    it( "Should have parsed data that contains expected number of lines", function(done){
        getExpectedLines(targetFile)
        .then(function(expectedLines){
            asserts(parsedLines.length === expectedLines );
            done();
        });
    });
});

describe("Test Log Compactor by Event",function(){
    var targetFile = path.resolve(_SAMPLES_DIR,"logfileCompactorSample.txt");
    var compactor = new LogFileCompactor();
    it("Should have a valid Test Sample File",function(done){
        fs.access(targetFile,done);
    });

    it("Should have a Log Compactor instantiated",function(){ asserts(compactor);});

    var parsedLines = null;
    var lineCount = 0;
    it( "Should parse Lines from Sample File",function(done){
        compactor.on( "line", function(){
            lineCount++;
        });
        compactor.on( "close", function(){
            parsedLines = compactor.parsed();
            done();
        });

        var lineReader = ReadLine.createInterface({ input: fs.createReadStream(targetFile)});
        lineReader.on("line", compactor.parse );
        lineReader.on("close", function(){ compactor.close(); });        
    });

    it("Should have counted lines from the line event",function(){
        asserts(lineCount);
    });

    it("Should have the counted the expected lines",function(done){
        getExpectedLines(targetFile)
        .then(function(expectedLines){
            try{
                asserts(lineCount === expectedLines);
            } finally {
                done();
            }
        })
        .catch(function(error){
            try{
                console.log( "Should not encounter an error" );
                console.log( error );
                asserts(!error);
            } finally{
                done();
            }
        });
    });
});

function getExpectedLines(targetFile){
    return new Promise(function(resolve,reject){
        var expectedLines = 0;
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetFile)});
        lineReader.on("line",function(line){
            if(/^(INFO|WARN|ERROR|DEBUG)\s/.test(line) ){
                expectedLines++;
            } else if(/^[A-Za-z]{3}\s\d{2},\s\d{4}\s\d{2}:\d{2}:\d{2}\s(AM|PM)\s/.test(line)){
                expectedLines++;
            }
        });
        lineReader.on("close",function(){
            resolve(expectedLines);
        });
    });
}