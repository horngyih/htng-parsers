function wrapUnwrapQuote(i){
    if(typeof i === "string"){
        return '\'' + i.replace(/^'/, '').replace(/'$/,'') + '\'';
    } else {
        return i;
    }
}

function retrieveMappingQuery( codeTypes, channelCode ){
    let codeTypeValues = [].concat(codeTypes).map(wrapUnwrapQuote).join(",");
    let channelCodeValue = wrapUnwrapQuote(channelCode);
    return `
        SELECT 
            "CodeTypeCode", 
            "CodeValue", 
            "PartnerCodeValue", 
            "PropertyCode", 
            "ChannelCode" 
        FROM 
            "CodeMapping" cm 
        LEFT OUTER JOIN 
            "CodeType" ct 
        USING 
            ("CodeTypeID") 
        WHERE 
            "CodeTypeCode" IN(${codeTypeValues})
        UNION
        SELECT 
            'PROPERTY' AS "CodeTypeCode", 
            "PropertyCode" AS "CodeValue", 
            "PartnerPropertyCode" AS "PartnerCodeValue", 
            "PropertyCode", 
            "PartnerType" AS "ChannelCode" 
        FROM 
            "PropertyCodeMapping" 
        WHERE 
            "PartnerType" = ${channelCodeValue}
    `;
}

module.exports = {
    selectCodeTypesByChannelCode : retrieveMappingQuery
}
