/* jshint esversion:6 */

const fs = require("fs");
const path = require( "path" );

const ReadLine = require("readline");

const asserts = require("assert");
const XMLjs = require("xml-js");

const _PROJECT_PATH = path.resolve(__dirname,"..");
const _SRC_PATH = path.resolve(_PROJECT_PATH,"src");
const _SAMPLES_PATH = path.resolve(_PROJECT_PATH,"samples");

const LogFileCompactor = require(path.resolve(_SRC_PATH,"utils","logFileCompactor"));
const Log4JEventParser = require(path.resolve(_SRC_PATH,"utils","log4jEventParser"));
const extractXML = require(path.resolve(_SRC_PATH,"utils","xmlExtractor"));

const sampleFile = path.resolve(_SAMPLES_PATH,"logfileCompactorSample.txt");

describe( "Test Extract XML and Parse as Json", function(){
    it("- Check Test Sample File", function(done){
        fs.access(sampleFile,done);
    });

    it("- XML Extractor Parser required", function(){
        asserts(extractXML);
    });

    var parsedLines = [];
    var parsedEvents = [];
    var xmls = [];
    var xmljsons = [];

    it("- Parsed Lines from Sample File", function(done){
        var lineReader = ReadLine.createInterface({input : fs.createReadStream(sampleFile)});

        var logFileCompactor = new LogFileCompactor();

        lineReader.on( "line", logFileCompactor.parse);
        lineReader.on( "close", function(){
            parsedLines = logFileCompactor.parsed();
            asserts(parsedLines && parsedLines.length);
            done();
        });
    });

    it("- Parsed Events from Parsed Lines", function(){
        var log4JEventParser = new Log4JEventParser();
        parsedEvents = parsedLines.map(log4JEventParser.parse);
        asserts(parsedEvents && parsedEvents.length);
    });

    it("- Extract XML from parsed events", function(){
        xmls = parsedEvents.map(function(event){
            return extractXML(event.data);
        }).filter((item)=>item);
        asserts(xmls && xmls.length);
    });

    it("- Extracted XML contains expected number of xmls", function(){
        var expectedXMLs = 0;
        expectedXMLs = parsedEvents.reduce(function(count, event){
            count = count || 0;
            if( event && event.data){
                var data = event.data;
                var xmlExtracted = /<\w+.*>/.exec(data);
                if( xmlExtracted && xmlExtracted[0] ){
                    count++;
                }

            }
            return count;
        }, expectedXMLs);

        asserts(xmls.length === expectedXMLs );
    });

    it("- Parse Extracted XML as JSON", function(){
        xmljsons = xmls.map(function(xml){return XMLjs.xml2json(xml,{compact:true, spaces:4});});
        asserts(xmls.length === xmljsons.length);
    });
});