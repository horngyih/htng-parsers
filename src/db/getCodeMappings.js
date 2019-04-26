const pg = require("pg");

const { selectCodeTypesByChannelCode } = require("./integrationQueries"); 

function mapItems(partition){
    if( typeof partition === "function" ){
        return (map, row)=>{
            map = map || {};
            let key = partition(row);
            let items = map[key]||[];
            items.push(row);
            map[key]=items;
            return map;
        };
    }

    return (map,row)=>{
        map = (Array.isArray(map))?map:[];
        map.push(row);
        return map;
    };
}
function processRows( rows ){
    let source = [].concat(rows);

    let codeMapsByProperty = source.filter(i=>i.CodeTypeCode!=="PROPERTY").reduce( mapItems(i=>i.PropertyCode), {} );
    let propertyMapped = source.filter(i=>i.CodeTypeCode==="PROPERTY").map(i=>{
        let obj = {};
        obj[i.CodeValue] = i.PartnerCodeValue;
        return obj;
    }).reduce( (map, entry)=>Object.assign({}, map, entry), {});

    let propertyCodeMap = Object.keys(codeMapsByProperty).reduce( (obj,key)=>{
        obj = obj||{};
        let items = [].concat(codeMapsByProperty[key]);
        let codeMapsByType = items.map(i=>{ return Object.assign({}, {codeType: i.CodeTypeCode}, { codeValue: i.CodeValue }, {partnerCodeValue : i.PartnerCodeValue});}).reduce(mapItems(i=>i.codeType),{});
        let codeMaps = Object.keys(codeMapsByType).reduce( (obj,key)=>{
            obj = obj || {};
            let items = [].concat(codeMapsByType[key]);
            obj[key] = items.map(i=>{
                let forward = {};
                forward[i.codeValue] = i.partnerCodeValue;
                let reverse = {};
                reverse[i.partnerCodeValue] = i.codeValue;
                return [ forward, reverse ];
           }).reduce( (obj, mappings)=> Object.assign({}, obj, ...mappings), {} );
            return obj;
        }, {});
        obj[propertyMapped[key]||key] = codeMaps;
        return obj;
    }, {});
    return propertyCodeMap;
}

function printResults(result){
    if( result && result.rows ){
        console.log(JSON.stringify(processRows(result.rows)));
    } else {
        console.log("No results");
    }
}

module.exports = processRows;
