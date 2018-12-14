function Rdims() {
    var that = this;

    var key = '7023115';
    var serviceUrl = 'https://ncrws478.tc.gc.ca/rais-web/'; // Dev
    ////var serviceUrl = 'https://tcappstest.tc.gc.ca/corp-serv-gen/5/rais-web/'; // Acc
    ////var serviceUrl = 'https://tcapps.tc.gc.ca/corp-serv-gen/5/rais-web/'; // Prod

    var clientUrl = Xrm.Page.context.getClientUrl();

    this.get = function (n) {
        return $.ajax({
            url: serviceUrl + 'Profiles(' + n + ')?apikey=' + key,
            type: 'GET',
            xhrFields: { withCredentials: true }
        });
    }

    this.create = function (d) {
        return $.ajax({
            type: "POST",
            url: serviceUrl + "Profiles?apikey=" + key,
            data: JSON.stringify(d),
            contentType: "text/plain",
            crossDomain: true,
            xhrFields: { withCredentials: true }
        });
    }

    this.find = function (search) {
        var query = '?apikey=' + key;
        for (var attr in search)
            query += '&' + attr + '=' + search[attr];

        return $.ajax({
            type: 'GET',
            url: serviceUrl + 'Search' + query,
            xhrFields: { withCredentials: true }
        });
    }

    this.opis = function (term) {
        var url = serviceUrl + "Opis('" + term + "')?apikey=" + key;
        return $.ajax({
            type: "GET",
            url: url,
            xhrFields: { withCredentials: true }
        });
    }

    this.classifications = function (term) {
        var url = serviceUrl + "Classifications('" + term + "')?apikey=" + key;
        return $.ajax({
            type: "GET",
            url: url,
            xhrFields: { withCredentials: true }
        });
    }
}
