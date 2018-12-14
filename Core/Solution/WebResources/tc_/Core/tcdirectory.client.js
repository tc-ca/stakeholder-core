function TcDirectory() {

    var that = this;
    ////var url = "http://amstcappsdev2/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; // Dev
    var url = "https://tcappstest.tc.gc.ca/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; // Acc
    ////var url = "https://tcapps.tc.gc.ca/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; // Prod
    var key = "f4142218-71e9-473c-b1b7-ae62dbde1275";

    this.domainNames = function (term) {
        var requestUrl = url + "CurrentClients?$filter=startswith(tolower(UserId), '" + term.toLowerCase() + "') eq true&$select=UserId&$top=5&apikey=" + key;
        return $.ajax({
            type: "GET",
            url: requestUrl
        });
    }
}
