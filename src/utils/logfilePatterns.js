var LOGLEVEL_RX = /INFO|ERROR|WARN|DEBUG/;
var LOGTIMESTAMP_RX = /\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/;
var CLASSTRACE_RX = /\(.+:\d+\)/;

module.exports = {
    LOGLEVEL : LOGLEVEL_RX,
    LOGTIMESTAMP : LOGTIMESTAMP_RX,
    CLASSTRACE : CLASSTRACE_RX
}