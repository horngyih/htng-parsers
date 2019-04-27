const rx = require("rxjs");
const rxops = require("rxjs/operators");

function asRegExp( expr ){
    try{
        return (expr instanceof RegExp)? expr : ( typeof expr === "string" )? new RegExp(expr) : null;
    } catch(err){
        return null;
    }
}

function compact(observable, start, end ){
    start = asRegExp(start) || /./;
    end = asRegExp(end);    
    let subject = new rx.ReplaySubject();
    if( observable && typeof observable.subscribe === "function" ){
        let buffer = [];
        function inGroup(){
            return buffer && buffer.length > 0;
        }

        function emitGroup(group){
            subject.next(group);
        }

        function newGroup(){
            if( inGroup() ){
                emitGroup([].concat(buffer));
            }
            buffer = [];
        }

        observable.subscribe(
            line=>{
                if( inGroup() ){
                    if( line.match(start) ){
                        newGroup();
                    }
                    buffer.push(line);
                    if( end && line.match(end) ){
                        newGroup();
                    }
                 } else {
                     if( line.match(start) ){
                         buffer.push(line);
                         if( end && line.match(end) ){
                             newGroup();
                         }
                     }
                 }
            },
            err=>{
                subject.error(err);
            },
            ()=>{
                if( inGroup() ){
                    emitGroup(buffer);
                }
                subject.complete();
            }
        );

    } else {
        subject.complete();
    }

    return subject.pipe(rxops.map(i=>i.join(" ")));
}

module.exports = {
    compact : compact
}
