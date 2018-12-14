var attr;
var column;
var url;

function load() {
    var pMap = getQueryParams();
    var field = pMap["field"];
    column = pMap["col"];
    url = pMap["url"];
    attr = window.parent.Xrm.Page.getAttribute(field);
    attr.controls.forEach(function (c, i) {
        c.setVisible(0);
    });
    let element = document.getElementById('controlText');
    element.addEventListener('change', function (e) {
        attr.setValue(e.currentTarget.value);
    });

    element.addEventListener('focus', function () {
        if (element.value == "--") element.value = "";
    });
    element.addEventListener('blur', function () {
        if (element.value == "") element.value = "--";
    });

    $("#controlText").autocomplete({
        source: searchUrl,
        delay: 100,
        minLength: 2,
        select: function (e, ui) {
            attr.setValue(ui.item.label);
            element.value = ui.item.label;
            return false;
        }
    });

    if (attr.getValue()) {
        element.value = attr.getValue();
    }
}

function getQueryParams() {
    var data = unescape(location.search);
    data = data.substring(6, data.length);
    var parameters = data.split("&");
    var pMap = [];
    for (var i = 0; i < parameters.length; i++) {
        var key = parameters[i].substring(0, parameters[i].indexOf("="));
        var value = parameters[i].substring(parameters[i].indexOf("=") + 1, parameters[i].length);
        pMap[key] = value;
    }
    return pMap;
}

function searchUrl(request, response) {
    var text = request.term.toLowerCase();
    var reqUrl = url;
    reqUrl += "?$select=";
    reqUrl += column;
    reqUrl += "&$filter=startswith(tolower(";
    reqUrl += column;
    reqUrl += "), '";
    reqUrl += text;
    reqUrl += "')";
    var req = new XMLHttpRequest();
    req.open("GET", reqUrl);
    req.onloadend = function() {
        if (req.status != 200) return;
        var data = JSON.parse(req.responseText);
        response(data.value.map(function (x) { return x[column]; }));
    };
    req.send();
}
