const fs = require("fs");
const rl = require("readline");
const Rx = require("rxjs");

function readFile(filename){
    return new Promise((resolve,reject)=>{
        try{
            let lines = [];
            rl.createInterface({ input: fs.createReadStream(filename)})
                .on("line", l=>lines.push(l))
                .on("close", ()=>resolve(lines));
        } catch(err){
            reject(err);
        }
    });
}

function fileLines(filename){
    let subject = new Rx.ReplaySubject();
    try{
        let buffer = "";
        let fis = fs.createReadStream(filename, "utf8");
        subject = lineStreamReader(fis);
    } catch( err ){
        subject = new Rx.ReplaySubject();
        subject.onError(err);
    }
    return subject;
}

function lineStreamReader(stream){
    let subject = new Rx.ReplaySubject();
    if( stream && stream.on ){
        let buffer = '';
        stream.on( "data", data=>{
            buffer += data;
            let lines = buffer.split("\n");
            buffer = lines.pop();
            lines.forEach(line=>subject.next(line));
        });
        stream.on("close", ()=>{
            subject.complete();
        });
    } else {
        subject.complete();
    }
    return subject;
}

module.exports = {
    readFile : readFile,
    fileLines: fileLines,
    lineStreamReader : lineStreamReader
}
