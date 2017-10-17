/* jshint esversion:6 */

const path = require("path");
const assert = require("assert");

const moment = require("moment");

const _PROJECT_DIR = path.resolve(__dirname,"..");
const _SRC_DIR = path.resolve(_PROJECT_DIR,"src");
const _SAMPLES_DIR = path.resolve(_PROJECT_DIR,"samples");

const sampleJson = require( path.resolve(_SAMPLES_DIR,"OTA_HotelRatePlanNotifRQ.json" ) );
const ratePlanNotif = require( path.resolve(_SRC_DIR,"messages","otaHotelRatePlanNotifRQ"));

describe( "Test OTAHotelRatePlanNotifRQ Util",function(){
    describe("Test OTA_HotelRatePlanNotifRQ Parser",function(){
        var message = ratePlanNotif.parseOTAHotelRatePlanNotifRQ(sampleJson);
        var propertyCode = getPropertyCode(sampleJson);
        var echoToken = getEchoToken(sampleJson);
        var correlationID = getCorrelationID(sampleJson);
        var timestamp = getTimestamp(sampleJson);
        it("Should parse and return a OTA_HotelRatePlanNotifRQ",function(){
            assert(message);
            assert(message instanceof ratePlanNotif.OTAHotelRatePlanNotifRQ);
        });

        it("Parsed message should have the expected property code", function(){
            assert(message.propertyCode === propertyCode);
        });

        it("Parsed message should have the expected EchoToken", function(){
            assert(message.echoToken === echoToken );
        });

        it("Parsed message should have the expected CorrelationID", function(){
            assert(message.correlationID === correlationID );
        });

        it("Parsed message should have the same timestamps", function(){
            assert(message.timestamp.isSame(timestamp));
        });
    });

    describe("Test Flatten OTA_HotelRatePlanNotif",function(){
        var messages = ratePlanNotif.flattenOTAHotelRatePlanNotifRQ(sampleJson);
        var propertyCode = getPropertyCode(sampleJson);
        var echoToken = getEchoToken(sampleJson);
        var correlationID = getCorrelationID(sampleJson);
        var timestamp = getTimestamp(sampleJson);
        it("Should parse flattened OTA_HotelRatePlanNotif message",function(){
            assert(messages);
            assert(Array.isArray(messages));
            assert(messages.length > 0 );
        });

        it("All flattened messages should have the expected property code", function(){
            messages.reduce(function(result,message){
                result = result || false;
                if( message ){
                    result |= message.propertyCode === propertyCode;
                }
                return result;
            },false);
        });

        it("All flattened messages should have the expected EchoToken", function(){
            messages.reduce(function(result,message){
                result = result || false;
                if( message ){
                    result |= message.echoToken === echoToken;
                }
                return result;
            },false);
        });

        it("All flattened messages should have the expected CorrelationID", function(){
            messages.reduce(function(result, message){
                result = result || false;
                if( message ){
                    result |= message.correlationID === correlationID;
                }
                return result;
            }, false);
        });

        it("All flattened messages should have the expected timestamp", function(){
            messages.reduce(function(result, message){
                result = result || false;
                if( message ){
                    result |= message.timestamp.isSame(timestamp);
                }
                return result;
            },false);
        })
    })
});

function getEchoToken(json){
    if( json ){
        var rootAttributes = getRootAttributes(json);
        if( rootAttributes ){
            return rootAttributes.EchoToken;
        }        
    } else {
        return null;
    }
}

function getCorrelationID(json){
    if(json){
        var rootAttributes = getRootAttributes(json);
        if( rootAttributes ){
            return rootAttributes.CorrelationID;
        }
    }
}

function getTimestamp(json){
    if(json){
        var rootAttributes = getRootAttributes(json);
        if(rootAttributes){
            return (rootAttributes.TimeStamp)?moment(rootAttributes.TimeStamp):null;
        }
    }
}

function getPropertyCode(json){
    if( json ){
        var root = getRootElement(json);
        if( root.RatePlans && root.RatePlans._attributes ){
            var attributes = root.RatePlans._attributes;
            return attributes.HotelCode;
        }
    } else {
        return null;
    }
}

function getRootAttributes(json){
    if(json){
        var root = getRootElement(json);
        if( root && root._attributes ){
            return root._attributes;
        }
    } else {
        return null;
    }
}

function getRootElement(json){
    if(json){
        return json.OTA_HotelRatePlanNotifRQ;
    } else {
        return null;
    }
}