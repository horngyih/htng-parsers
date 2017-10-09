var fs = require("fs");
var ReadLine = require("readline");
var targetFile = process.argv.slice(2)[0];

var Log4JParser = require("./log4jParser");

var parser = new Log4JParser();
console.log( parser.parse );

var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetFile)});
lineReader.on("line", parser.parse);
lineReader.on("close", ()=>console.log(parser.getParsedLines()));