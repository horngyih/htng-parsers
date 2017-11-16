var _moment = require("moment");

function flatten(arr, item){
    arr = arr || [];
    if( Array.isArray(item)){
        return arr.concat(item.reduce(flatten,[]));
    } else {
        arr.push(item);
    }
    return arr;
}

function filterEmpty(item){
    return item;
}

function dateFormatter(dateFormat){
    dateFormat = dateFormat || "YYYY-MM-DD";
    return function(target){
        if(_moment.isMoment(target)){
            try{
                return target.format(dateFormat);
            } catch( error ){}
        }
        return target;
    };
}

function numberFormatter(){
    return function(target){
        if( typeof target === "string" ){
            try{
                return parseInt(target);
            } catch(error){}
        }
        return target;
    }
}

function stringFormatter(clip, ellipsis){
    return function(target){
        if( typeof target === "string" ){
            if( clip > 0 ){
                return target.substring(0,clip);
            } else {
                return target.toString();
            }
        } else {
            return target;
        }
    }
}

function booleanFormatter(){
    return function(target){
        if( target === true ){
            return "true";
        } else {
            return "false";
        }
    };
}

module.exports = {
    flatten : flatten,
    filterEmpty : filterEmpty,
    dateFormatter : dateFormatter,
    numberFormatter : numberFormatter,
    stringFormatter : stringFormatter,
    booleanFormatter : booleanFormatter
};