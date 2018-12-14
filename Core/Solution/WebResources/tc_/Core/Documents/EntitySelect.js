var fileUrl = "Whitelist.xml";
var completed = 0;
var entities = [];
var entityNames = [];
var Xrm;
var control;

function buildEntityList() {
    Xrm = window.parent.Xrm;
    pMap = getQueryParams();
    control = Xrm.Page.getControl(pMap["control"]);
    $.ajax({
        type: "GET",
        url: fileUrl,
        dataType: "text",
        success: function (d) {
            var results = JSON.parse(d);
            for (var i = 0; i < results.length; i++) {
                entityNames.push(results[i]);
            }

            getEntityNames().then(handleRetrieveEntitySuccess);
        }
    });
}

function getEntityNames() {
    var url = Xrm.Page.context.getClientUrl();
    url = url + '/api/data/v8.2/EntityDefinitions?$select=DisplayName,LogicalName';
    return $.ajax({
        type: 'GET',
        url: url,
        beforeSend: oDataBeforeSend
    });
}

function getQueryParams() {
    var data = unescape(location.search);
    data = data.substring(6, data.length);
    var parameters = data.split("&");
    var pMap = [];
    var parameter = [];
    for (var i = 0; i < parameters.length; i++) {
        parameter = parameters[i].split("=");
        pMap[parameter[0]] = parameter[1];
    }
    return pMap;
}

function handleRetrieveEntitySuccess(results) {
    if (!results) return;
    for (var i = 0; i < entityNames.length; i++) {
        var match = results.value.filter(function (x) { return x.LogicalName == entityNames[i]; })
        if (match.length == 0) continue;

        entities.push(match[0]);
    }
    
    buildOptions();
}

function buildOptions() {
    var optionSet = document.getElementById("entities");
    var option = document.createElement("option");
    option.text = "--";
    option.value = "";
    optionSet.add(option);

    for (var i = 0; i < entities.length; i++) {
        var option = document.createElement("option");
        option.text = entities[i].DisplayName.UserLocalizedLabel.Label;
        option.value = entities[i].LogicalName;
        optionSet.add(option);
    }

    optionSet.onchange = function () {
        Xrm.Page.getAttribute("tc_entitycd").setValue(this.value);
    }

    optionSet.value = Xrm.Page.getAttribute("tc_entitycd").getValue();

    setSize();
}

function setSize() {
    var o = control.getObject();
    o.style.height = (o.contentDocument.body.scrollHeight + 5) + 'px';
}

function oDataBeforeSend(req) {
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json: charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
}
