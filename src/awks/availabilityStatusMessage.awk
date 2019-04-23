# 1     2     3        4            5      6       7 8          9    1011        12   13   1415          16                   17    18                  19    2021             2223                  24           
# INFO  04-09 22:28:59 Availability Status Message : ||Property Code : HGJB||Inv Type Code : DLXQ||Start Date:2019-04-09||End Date: 2019-04-09||Booking Limit : 1||Restriction : Master||Restriction Status:[Open##  (PdsPullAvail.java:365)

BEGIN{
    print "timestamp|EchoToken/CorrelationID|Property Code|Booking Limit|Message Type|Start Date|End Date|Rate Plan|Room Type|xFreeSell|xArrival|xDeparture|xTA|xORG";
    delimiter="|";
}
/Availability Status Message/{
    timestamp="2019-"$2" "$3;
    echoToken="WISHNET-Update";
    propertyCode=substr($11,0,index($11,"|")-1);
    ratePlan="ONL1";
    roomType=substr($15, 0, index($15, "|")-1);
    startDate=substr($16, index($16,":")+1,10);
    endDate=substr($18, 0, 10);
    bookingLimit=substr($21, 0, index($21,"|")-1);
    if( $24 ~/Open/ ) {
        restriction=substr($24, index($24,"[")+1, 4);
    } else if( $24 ~/Close/ ){
        restriction=substr($24, index($24,"[")+1, 5);
    }

    if( bookingLimit ~/null/ ){
        messageType="RemoveLimit";
    } else {
        messageType="SetLimit";
    }

    if( restriction ~/Open/ ){
        xFreeSell="FALSE";
    } else if( restriction ~/Close/ ){
        xFreeSell="TRUE";
    }

    xArrival = "FALSE";
    xDeparture = "FALSE";
    xTA = "FALSE";
    xORG = "FALSE";
    printf "%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s\n", timestamp, echoToken, propertyCode, bookingLimit, messageType, startDate, endDate, ratePlan, roomType, xFreeSell, xArrival, xDeparture, xTA, xORG; 
    #print timestamp""delimiter""echoToken""delimiter""propertyCode""delimiter""roomType""delimiter""startDate""delimiter""endDate""delimiter""bookingLimit""delimiter""messageType""delimiter""restriction
}
