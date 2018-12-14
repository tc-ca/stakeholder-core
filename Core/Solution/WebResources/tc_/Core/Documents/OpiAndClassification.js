var Xrm;
var control;

function configure() {
    var db = new DocumentRepository();
    Xrm = window.parent.Xrm;
    pMap = getQueryParams();
    control = Xrm.Page.getControl(pMap["control"]);

    var lcid = Xrm.Page.context.getUserLcid().toString();
    $('#documentClassInputLabel').text(labels.classification[lcid]);
    $('#documentOpiInputLabel').text(labels.opi[lcid]);

    // Autocomplete
    $("#opi").autocomplete({
        source: db.searchOpis,
        delay: 500,
        minLength: 2,
        change: changeHandler('tc_defaultopicd')
    });
    $("#classification").autocomplete({
        source: db.searchClassifications,
        delay: 500,
        minLength: 2,
        change: changeHandler('tc_classificationlbl')
    });

    $('#opi').on('change', changeHandler("tc_defaultopicd"));
    $('#classification').on('change', changeHandler("tc_classificationlbl"));
    $('.input-text').focus(function () { if ($(this).val() == '--') $(this).val(''); })
    $('.input-text').blur(function () { if ($(this).val() == '') $(this).val('--'); })

    document.getElementById("opi").value = Xrm.Page.getAttribute("tc_defaultopicd").getValue();
    document.getElementById("classification").value = Xrm.Page.getAttribute("tc_classificationlbl").getValue();

    setSize();

    Xrm.Page.data.entity.addOnSave(resetSubmitMode);
}

function changeHandler(attr) {
    return function () {
        Xrm.Page.getAttribute(attr).setValue($(this).val());
        Xrm.Page.getAttribute(attr).setSubmitMode('always');
    }
}

function resetSubmitMode() {
    Xrm.Page.getAttribute("tc_defaultopicd").setSubmitMode('dirty');
    Xrm.Page.getAttribute("tc_classificationlbl").setSubmitMode('dirty');
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

function setSize() {
    var o = control.getObject();
    o.style.height = (o.contentDocument.body.scrollHeight + 55) + 'px';
}
