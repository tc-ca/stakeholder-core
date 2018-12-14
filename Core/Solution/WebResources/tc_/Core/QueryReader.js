function QueryReader() {
    var data = unescape(location.search);
    data = data.substring(data.indexOf('?') + 1, data.length);
    var parameters = data.split("&");
    var parameter = [];
    for (var i = 0; i < parameters.length; i++) {
        parameter = parameters[i].split("=");
        this[parameter[0]] = parameter[1];
    }
}
