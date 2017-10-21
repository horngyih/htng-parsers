/* jshint esversion:6 */

var logPatterns = require("./logfilePatterns");

var defaultOptions = {
    linestart : [ logPatterns.LOGLEVEL_START, logPatterns.JAXB_START ]
}

function LogFileCompactorEvent(eventCode, data){
    this.eventCode = eventCode;
    this.data = data;
}

/**
 * Process a given log file and compress multi-line events into a line token
 * 
 * Current options available:-
 * - linestart : specifies the regular expresssion(s) to be taken as a line start for a multi-line log event.
 * 
 * @param {*} options - Options to configure the behaviour of the the compactor; currently is to input the termnator of an event. 
 */
function LogFileCompactor( options ){
    options = options || {};
    options = Object.assign({}, options, defaultOptions);
    var parsedLines = [];
    var parseStack = [];
    var listeners = {};

    function fireEvent(event){
        if( event instanceof LogFileCompactorEvent ){
            var eventCode = (typeof event.eventCode === "string")?event.eventCode.toLowerCase():null;
            if( eventCode ){
                var eventListeners = listeners[eventCode];
                if( Array.isArray(eventListeners) && eventListeners.length > 0 ){
                    eventListeners.forEach(function(listener){
                        if(typeof listener === "function" ){
                            listener(event.data);
                        }
                    });
                }
            }
        }
    }

    function addLine(line){
        parsedLines.push(line);
        fireEvent(new LogFileCompactorEvent("line",line));
    }

    function isLineStart(line, linestartTest){
        linestartTest = linestartTest || defaultOptions.linestart;
        if( Array.isArray(linestartTest)){
            return linestartTest.reduce(function(result, test){
                result = result || false;
                result |= test.test(line);
                return result;
            },false);
        } else {
            return (linestartTest.test(line))?true:false;
        }
    }

    this.parse = function parse(line){
        if( line ){
            if( isLineStart(line, options.linestart)){
                if( parseStack && parseStack.length > 0 ){
                    addLine(parseStack.join(""));
                    parseStack = [];
                }
            }
            parseStack.push(line);
        }
    };

    this.parsed = function parsed(){
        this.flush();
        return parsedLines.filter((line)=>line);
    };

    this.flush = function(){
        if( parseStack ){
            addLine(parseStack.join(""));
            parseStack = [];
        }        
    }

    this.close = function(){
        fireEvent(new LogFileCompactorEvent("close",null));
    };

    this.on = function(eventCode, callback){
        if( typeof eventCode === "string" && typeof callback === "function" ){
            var eventListeners = listeners[eventCode.toLowerCase()];
            if( !eventListeners ){
                eventListeners = [];
            }
            eventListeners.push(callback);
            listeners[eventCode.toLowerCase()] = eventListeners;
        }
    }    
}

module.exports = LogFileCompactor;