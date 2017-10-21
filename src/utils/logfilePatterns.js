const LOGLEVEL = "(INFO|ERROR|WARN|DEBUG)";
const ALT_TIMESTAMP = "[A-Za-z]{3}\\s\\d{2},\\s\\d{4}\\s\\d{2}:\\d{2}:\\d{2}\\s(AM|PM)";

const LOGLEVEL_RX = new RegExp(LOGLEVEL);
const LOGLEVEL_START_RX = new RegExp("^"+LOGLEVEL+"\\s");

const ALT_TIMESTAMP_RX = new RegExp(ALT_TIMESTAMP);
const JAXB_START_RX = new RegExp("^"+ALT_TIMESTAMP+"\\s");

var LOGTIMESTAMP_RX = /\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/;
var CLASSTRACE_RX = /\(.+:\d+\)/;

module.exports = {
    JAXB_START : JAXB_START_RX,
    LOGLEVEL_START : LOGLEVEL_START_RX,
    LOGLEVEL : LOGLEVEL_RX,
    LOGTIMESTAMP : LOGTIMESTAMP_RX,
    ALT_TIMESTAMP : ALT_TIMESTAMP_RX,
    CLASSTRACE : CLASSTRACE_RX
}