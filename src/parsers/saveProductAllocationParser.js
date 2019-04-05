const fs = require("fs");
const rl = require("readline");

const SAVE_PRODUCT_ALLOCATION = /\/ca\/inventory\/saveProductAllocations/;

function loadLog(filename){
    return new Promise((resolve,reject)=>{
        try{
        let lines = [];
        rl.createInterface({input: fs.createReadStream(filename)})
        .on('line', l=>{ if( l.match(SAVE_PRODUCT_ALLOCATION) ) lines.push(l); })
        .on('end', ()=>resolve(lines))
        .on('close', ()=>resolve(lines));
        } catch( err ){
            console.log(err);
        }
    });
}

function mapHeader(value){
    let dayOfWeekNumber = /dayOfWeekList\[(.+?)\]/;
    let dowNumber =  value.match(dayOfWeekNumber);
    if( dowNumber && dowNumber.length ){
        switch(dowNumber[1]){
            case '0':
                return 'Close Mon';
            case '1':
                return 'Close Tues';
            case '2':
                return 'Close Wed';
            case '3':
                return 'Close Thur';
            case '4':
                return 'Close Fri';
            case '5':
                return 'Close Sat';
            case '6':
                return 'Close Sun';
            default:
                return value;
        }
    } else {
        return value;
    }
}

function parse(filename){
    return new Promise( (resolve, reject)=>{        
        loadLog(filename)
        .then(lines=>{
            return new Promise( (resolve,reject)=>{
                let parsed = lines
                .map(i=>{
                    return i.split(" ")[6];
                })
                .map(i=>i.split("?"))
                .filter(i=>i.length>1)
                .map(i=>decodeURIComponent(i[1]).replace(/__|checkbox_/g, '' ).split("&"))
                .map(i=>i.map(j=>j.split("=")).map(i=>Object.assign({},{key : i[0]},{value:i[1]})))
                .map(i=>i.reduce( (obj,attr)=>{
                        obj = obj || {};

                        if( attr.key === "productCode" ){
                            let productCodeTokens = attr.value.split("%");
                            obj["productCode"] = productCodeTokens[0];
                            obj["productItemCode"] = productCodeTokens[1];
                        } else {
                            obj[attr.key] = attr.value;
                        }
                        return obj;
                    }, {})
                );
            
                let headers = Object.keys(parsed[0]).map(mapHeader);
                let data = [];
                parsed.forEach(i=>{
                    let values = [];
                    headers.forEach(v=>{
                        values.push(i[v]);
                    });
                    data.push(values);
                });
                let result = [];
                result.push(headers);
                result = result.concat(data);
                resolve(result);
            });
        })
        .then(resolve);
    });
}

module.exports = {
    parse : parse
}
