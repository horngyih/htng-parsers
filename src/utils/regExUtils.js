function asRegExp(...pattern){
    return pattern.map(
        pattern=>{
            if( pattern instanceof RegExp ){
                return pattern;
            } else if( typeof pattern === "string" || typeof pattern === "number" ){
                try{
                    return new RegExp(pattern.toString().trim());
                } catch(err){}
            }
            return null;
        }
    );
}

module.exports = {
    asRegExp : asRegExp
};
