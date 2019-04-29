const rxjs = require("rxjs");
const rxops = require("rxjs/operators");

function correlate( observable, correlation, maxCount ){
    maxCount = maxCount || 1;
    let correlationMap = {};
    let subject = new rxjs.ReplaySubject();
    try{
        if( observable && observable.subscribe){
            observable.subscribe(
                line=>{
                    let key = correlation(line);
                    if( typeof key === "string" && "" !== key.trim() ){
                        let group = correlationMap[key]||[];
                        group.push(line);
                        if( group.length >= maxCount ){
                            subject.next(group);
                            delete correlationMap[key];
                        }
                        correlationMap[key] = group;
                    }
                },
                err=>{
                    subject.error(err);
                },
                ()=>{
                    subject.complete();
                }
            );
        } else {
            subject.complete();
        }
    }catch(err){
        subject.error(err);
    }
    return subject;
}

module.exports = correlate;
