const rxjs = require("rxjs");
const rxops = require("rxjs/operators");

const {lineStreamReader} = require("./src/utils/lineReader");
const {compact} = require("./src/utils/compactor");
const correlate = require("./src/utils/correlator");

const messageUtils = require("./src/messages/messageUtils");
const ypMessages = require("./src/messages/yieldplanet/messageTypes");


const fs = require("fs");
let idKey = /(?:ID:\s)(\d+)(?:\s)/;

lines = compact( lineStreamReader( fs.createReadStream("./samples/integration-yieldplanet-soap.log.2") ), "INFO" );
correlated = correlate(lines, line=>(line.match(idKey)||["","noID"])[1], 2 );
let messagePatterns = [/inbound/i, /outbound/i];
correlated
    .pipe(
        rxops.map(group=>{
            return rxjs.from(group)
                .pipe( ...messageUtils.parseXMLPipe(ypMessages), rxops.reduce( (arr,message)=>(arr||[]).concat(message), [] ) );
        }),
        rxops.mergeAll(),
        rxops.filter(i=>i&&i.length>0)
   )
    .subscribe(console.log);
