const rxjs = require("rxjs");
const rxops = require("rxjs/operators");

const {lineStreamReader} = require("./src/utils/lineReader");
const {compact} = require("./src/utils/compactor");
const correlate = require("./src/utils/correlator");

const fs = require("fs");
let idKey = /(?:ID:\s)(\d+)(?:\s)/;

lines = compact( lineStreamReader( fs.createReadStream("./samples/integration-yieldplanet-soap.log") ), "INFO" );
correlated = correlate(lines, line=>(line.match(idKey)||["","noID"])[1], 2 );
correlated.subscribe(console.log);
