var tcDirectory;

function onLoad(context) {
    tcDirectory = new TcDirectory(context.getContext().getClientUrl());
    Xrm.Page.data.entity.attributes.forEach(function (a, i) {
        a.controls.forEach(function (c, j) {
            c.setDisabled(1);
        });
    });

    var directoryId = Xrm.Page.getAttribute('tc_directoryid').getValue();
    if (!directoryId) return;

    refreshData(directoryId);
}

function refreshData(id) {
    tcDirectory.getDirectoryOrganization(id, function (organization) {
        if (!organization) return;

        var record = tcDirectory.copyOrganization(organization);
        for (var prop in record)
            Xrm.Page.getAttribute(prop.toLowerCase()).setValue(record[prop]);

        Xrm.Page.data.entity.attributes.forEach(function (a, i) {
            a.setSubmitMode('always');
        });

        Xrm.Page.data.entity.save();
        getParentOrganization(organization.ParentOrganizationId);
        getChildOrganizations(organization.OrganizationId);
    });
}

function getParentOrganization(id) {
    if (!id) return;

    tcDirectory.getOrganizationByDirectoryId(id, function (organization) {
        if (!organization) {
            tcDirectory.getDirectoryOrganization(id, function (organization) {
                if (!organization) return;
                var record = tcDirectory.copyOrganization(organization);
                tcDirectory.addOrganization(record, setParentOrganization);
            });
            return;
        }

        setParentOrganization(organization);
    });
}

function setParentOrganization(organization) {
    if (!organization) return;

    var lookup = [{
        id: '{' + organization.tc_ayorganizationunitid.toUpperCase() + '}',
        entityType: 'tc_ayorganizationunit'
    }];
    var current = Xrm.Page.getAttribute('tc_parentorganizationid').getValue();
    if (current && current[0] && current[0].id == lookup[0].id) return;

    Xrm.Page.getAttribute('tc_parentorganizationid').setValue(lookup);
    Xrm.Page.getAttribute('tc_parentorganizationid').setSubmitMode('always');
    Xrm.Page.data.entity.save();
}

function getChildOrganizations(id) {
    tcDirectory.getDirectoryChildOrganizations(id, function (organization) {
        if (!organization) return;
        updateChild(organization);
    });
}

function updateChild(organization) {
    tcDirectory.getOrganizationByDirectoryId(organization.OrganizationId, function (record) {
        var copy = tcDirectory.copyOrganization(organization);
        var id = Xrm.Page.data.entity.getId() + '';
        id = id.substring(1, id.length - 1);
        copy["tc_ParentOrganizationId@odata.bind"] = '/tc_ayorganizationunits(' + id + ')';

        if (record) {
            copy.tc_ayorganizationunitid = record.tc_ayorganizationunitid;
            tcDirectory.updateOrganization(copy);
        }
        else tcDirectory.addOrganization(copy);

        Xrm.Page.getControl('childOrganizationsGrid').refresh();
    });
}
