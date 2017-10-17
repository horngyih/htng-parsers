/* jshint esversion:6 */

const path = require("path");
const assert = require("assert");

const _PROJECT_DIR = path.resolve(__dirname,"..");
const _SRC_DIR = path.resolve(_PROJECT_DIR,"src");
const _SAMPLES_DIR = path.resolve(_PROJECT_DIR,"samples");

const sampleJson = require( path.resolve(_SAMPLES_DIR,"OTA_HotelAvailNotifRQ.json" ) );

const availNotif = require( path.resolve(_SRC_DIR,"messages","otaHotelAvailNotifRQ"));

describe( "Test OTA_HotalAvailNotifRQ Util", function(){
    describe( "Test OTA_HotelAvailNotifRQ Parser",function(){
        var message = availNotif.parseOTAHotelAvailNotifRQ(sampleJson);
        var propertyCode = getPropertyCode(sampleJson);
        var echoToken = getEchoToken(sampleJson);
        var correlationID = getCorrelationID(sampleJson);
        var availStatusMessage = getAvailStatusMessage(sampleJson);
        it("Should parse and return a OTA_HotelAvailNotifRQ object",function(){
            assert(message);
            assert(message instanceof availNotif.OTAHotelAvailNotifRQ);
        });

        it("Should have the expected property code", function(){
            assert(message.propertyCode);
            assert(message.propertyCode === propertyCode );
        });

        it("Should have the expected EchoToken and CorrelationID", function(){
            assert(message.echoToken);
            assert(message.echoToken === echoToken );

            assert(message.correlationID);
            assert(message.correlationID === correlationID );
        });

        it("Should have the expected number of availabilityStatusMessages", function(){
            assert(message.availabilityStatusMessages);
            assert(Array.isArray(message.availabilityStatusMessages));
            assert(message.availabilityStatusMessages.length === availStatusMessage.length);
        });
    });

    describe( "Test Flatten OTA_HotelAvailNotifRQ", function(){
        var flattened = availNotif.flattenOTAHotelAvailNotifRQ(sampleJson);
        var propertyCode = getPropertyCode(sampleJson);
        var echoToken = getEchoToken(sampleJson);
        var correlationID = getCorrelationID(sampleJson);
        var availStatusMessages = getAvailStatusMessage(sampleJson);
        it("Should all have the expected property code", function(){
            assert(flattened.reduce(function(result,message){
                if( message ){
                    return message.propertyCode === propertyCode || result;
                } else {
                    return false;
                }
            },false));
        });

        it("Should all have the expected echo token", function(){
            assert(flattened.reduce(function(result,message){
                if( message ){
                    return message.echoToken === echoToken || result;
                }
            },false));
        });

        it("Should all have the expected correlationID", function(){
            assert(flattened.reduce(function(result,message){
                if( message ){
                    return message.correlationID === correlationID || result;
                }
            },false));
        });

        it("Should return the same number of flattened messages as the original AvailStatusMessage", function(){
            assert(flattened.length === availStatusMessages.length);
        });
    });
});

function getPropertyCode(sample){
    var availStatusMessages = getAvailStatusMessages(sample);
    if( availStatusMessages ){
        if( Array.isArray(availStatusMessages) && availStatusMessages.length > 0 ){
            availStatusMessages = availStatusMessages[0];
        }

        if( availStatusMessages._attributes){
            return availStatusMessages._attributes.HotelCode;
        }
    }
    return null;
}

function getEchoToken(sample){
    if( sample && sample.OTA_HotelAvailNotifRQ && sample.OTA_HotelAvailNotifRQ._attributes ){
        return sample.OTA_HotelAvailNotifRQ._attributes.EchoToken;
    } else {
        return null;
    }
}

function getCorrelationID(sample){
    if( sample && sample.OTA_HotelAvailNotifRQ && sample.OTA_HotelAvailNotifRQ._attributes){
        return sample.OTA_HotelAvailNotifRQ._attributes.CorrelationID;
    } else {
        return null;
    }
}

function getAvailStatusMessage(sample){
    var availStatusMessages = getAvailStatusMessages(sample);
    var result = [];
    if( availStatusMessages && availStatusMessages.AvailStatusMessage ){
        result = result.concat(availStatusMessages.AvailStatusMessage);
    }
    return result;
}

function getAvailStatusMessages(sample){
    if( sample && sample.OTA_HotelAvailNotifRQ ){
        return sample.OTA_HotelAvailNotifRQ.AvailStatusMessages;
    } else {
        return null;
    }
}