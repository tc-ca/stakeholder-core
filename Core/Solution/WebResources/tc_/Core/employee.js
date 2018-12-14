// Lock everything (except domain name if empty)
var tcDirectory;

function load(context) {
    tcDirectory = new TcDirectory(context.getContext().getClientUrl());
    Xrm.Page.data.entity.addOnSave(getEmployee);
    Xrm.Page.data.entity.attributes.forEach(function (a, i) {
        a.setSubmitMode("dirty");
    });
    Xrm.Page.data.entity.attributes.forEach(function (a,i){
        a.controls.forEach(function (c,j){
            c.setDisabled(1);
        });
    });
    Xrm.Page.getAttribute('tc_contactid').controls.forEach(function(c) { c.setDisabled(0); });

    var email = Xrm.Page.getAttribute("emailaddress");
    var username = Xrm.Page.getAttribute("tc_domainnameid");
    if (email.getValue()) {
        getEmployee();
        return;
    }
    else if (username.getValue()) {
        getEmployeeByUserName();
        return;
    }
    
    email.controls.forEach(function (c, i) {
        c.setDisabled(0);
    });
}

function getEmployee(e) {
    var email = Xrm.Page.getAttribute("emailaddress").getValue();
    if (!email) {
        getEmployeeByUserName(e);
        return;
    }

    tcDirectory.getDirectoryEmployeeEmail(email.toLowerCase(), populateAttributes);
    if (e) e.getEventArgs().preventDefault();

    Xrm.Page.getAttribute("emailaddress").controls.forEach(function (c, i) {
        c.setDisabled(1);
    });
}

function getEmployeeByUserName(e) {
    tcDirectory.getDirectoryEmployee(Xrm.Page.getAttribute("tc_domainnameid").getValue(), populateAttributes);
    if (e) e.getEventArgs().preventDefault();

    Xrm.Page.getAttribute("emailaddress").controls.forEach(function (c, i) {
        c.setDisabled(1);
    });
}

function populateAttributes(employee) {
    var email = Xrm.Page.getAttribute("emailaddress").getValue();
    if (!employee && !email) {
        var email = Xrm.Page.getAttribute("emailaddress").getValue();
        if (!email) email = Xrm.Page.getAttribute("tc_domainnameid").getValue();

        if (Xrm.Page.context.getUserLcid() == 1033)
            alert("Specified user (" + email + ") does not exist.");
        else
            alert("L'utiliseur sp�cifi� (" + email + ") n'existe pas.");

        Xrm.Page.getAttribute("emailaddress").controls.forEach(function (c, i) {
            c.setDisabled(0);
        });
        return;
    }

    Xrm.Page.data.entity.removeOnSave(getEmployee);

    if (!employee) {
        Xrm.Page.data.entity.save();
        return;
    }

    var record = tcDirectory.copyAttributes(employee);

    for (var prop in record) {
        Xrm.Page.getAttribute(prop.toLowerCase()).setValue(record[prop]);
        Xrm.Page.getAttribute(prop.toLowerCase()).setSubmitMode('always');
    }

    Xrm.Page.data.entity.save();
    getOrganization(employee.OrganizationId);
}

function getOrganization(id) {
    if (!id) return;

    tcDirectory.getOrganizationByDirectoryId(id, function (organization) {
        if (!organization) {
            tcDirectory.getDirectoryOrganization(id, function (organization) {
                if (!organization) return;
                var record = tcDirectory.copyOrganization(organization);
                tcDirectory.addOrganization(record, setOrganization);
            });
            return;
        }

        setOrganization(organization);
    });
}

function setOrganization(organization) {
    if (!organization) return;

    var lookup =[{
        id: '{' + organization.tc_ayorganizationunitid.toUpperCase() + '}',
        entityType : 'tc_ayorganizationunit'
    }];
    var current = Xrm.Page.getAttribute('tc_organizationid').getValue();
    if (current && current[0] && current[0].id == lookup[0].id) return;

    Xrm.Page.getAttribute('tc_organizationid').setValue(lookup);
    Xrm.Page.getAttribute('tc_organizationid').setSubmitMode('always');
    Xrm.Page.data.entity.save();
}
