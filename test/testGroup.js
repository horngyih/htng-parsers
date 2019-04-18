const assert = require("assert");
const lr = require("../src/utils/lineReader");
const rx = require("rxjs");
const rxops = require("rxjs/operators");

const sampleFile = "./samples/group-test.log";

function group( observable, start, end ){

    try{
        start = (start instanceof RegExp)?start:(typeof start === "string")?new RegExp(start):/START/;
    } catch( err ){
        start = /START/;        
    }

    try{
        end = (end instanceof RegExp)?end:(typeof end === "string")?new RegExp(end):/END/;
    } catch( err ){
        start = /END/;
    }


    let subject = new rx.ReplaySubject();
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

    observable.subscribe(line=>{
        if( inGroup() ){
            if( !line.match(start) ){
                buffer.push(line);
            }

            if( line.match(start) || line.match(end) ){
                newGroup();
            }
        } else {
            if( line.match(start) ){
                buffer.push(line);
            }
        }
    },
    err=>subject.complete(),
    ()=>subject.complete()
    );

    return subject;
}

describe( "Test Group Line Stream", ()=>{
    let lines = lr.fileLines(sampleFile);
    lines.subscribe(console.log);
    let grouped = group(lines, /INFO/);
    grouped
        .pipe( 
            rxops.map( group=>group.filter( item => item.match(/^INFO/) ) ),
            rxops.map( group=>group.map( item => item.split(" ") ).map( item => parseInt(item[item.length-1]) ) ),
            rxops.map( group=>group.reduce( (sum,item)=>sum+item, 0 ) ),
            rxops.reduce( (sum,item)=>sum+item, 0 )
        )
        .subscribe(
            console.log
        );
});
