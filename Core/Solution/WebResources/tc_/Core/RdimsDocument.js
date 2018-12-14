var context;
var rais;
var tcDirectory;

function onLoad(c) {
    context = c;
    tcDirectory = new TcDirectory();
    rais = new DocumentRepository(tcDirectory);
    getDocument();
    resetSubmitModes();
    Xrm.Page.data.entity.addOnSave(getDocument);
}

function getDocument(context) {
    if (context)
        context.getEventArgs().preventDefault();

    var number = Xrm.Page.getAttribute("tc_rdimsnumbernum").getValue();
    if (number == "" || number == null)
        return;

    rais.get(number).then(populate);
    Xrm.Page.getControl("tc_rdimsnumbernum").setDisabled(number);
}

function populate(data) {
    if (!data || data.error) return;
    var profile = rais.copyAttributes(data);
    
    for (var prop in profile) {
        Xrm.Page.getAttribute(prop.toLowerCase()).setValue(profile[prop].Value ? profile[prop].Value : profile[prop]);
        Xrm.Page.getAttribute(prop.toLowerCase()).setSubmitMode('always');
    }

    Xrm.Page.data.entity.removeOnSave(getDocument);
    Xrm.Page.data.entity.save();

    tcDirectory.getByUsername(data.AuthorID, populateAuthor, true);
}

function populateAuthor(data) {
    if (!data) return;

    var lookup = [{
        id: data.tc_ayemployeeid,
        entityType: 'tc_ayemployee',
        name: data.tc_fullnamenm
    }];

    Xrm.Page.getAttribute('tc_authorid').setValue(lookup);
    Xrm.Page.getAttribute('tc_authorid').setSubmitMode('always');
    Xrm.Page.data.entity.save();
}

function resetSubmitModes() {
    Xrm.Page.data.entity.attributes.forEach(function (a, i) {
        if (a.getSubmitMode() == "always")
            a.setSubmitMode("dirty");
    });
}
