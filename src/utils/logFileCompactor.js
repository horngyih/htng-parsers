/* jshint esversion:6 */

var logPatterns = require("./logfilePatterns");

var defaultOptions = {
    terminator : logPatterns.CLASSTRACE
}

/**
 * Process a given log file and compress multi-line events into a line token
 * 
 * Current options available:-
 * - terminator : specifies the regular expression to be taken as terminator of a multi-line log event. (DEFAULT : Class trace "(<ClassFile>:<LineNumber>)" eg "(LogReader.java:123)")
 * 
 * @param {*} options - Options to configure the behaviour of the the compactor; currently is to input the termnator of an event. 
 */
function LogFileCompactor( options ){
    options = options || {};
    options = Object.assign({}, options, defaultOptions);
    var parsedLines = [];
    var parseStack = [];

    this.parse = function parse(line){
        if( line ){
            //Put line input in stack
            parseStack.push(line);
            if( options.terminator.test(line)){
                //If line has a terminator - parse as line
                parsedLines.push( parseStack.join(" ") );                
                parseStack = []; //Clear stack
            }
        }
    };

    this.parsed = function parsed(){
        return parsedLines.filter((line)=>line);
    };
}

module.exports = LogFileCompactor;