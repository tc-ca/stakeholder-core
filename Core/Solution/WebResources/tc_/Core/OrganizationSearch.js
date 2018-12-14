var tcDirectory;
var search;
var selectedItem;

function init() {
    tcDirectory = new TcDirectory(GetGlobalContext().getClientUrl());
    var urlComponents = tcDirectory.getUrlComponents();

    var regionTxt = isEnglish() ? 'RegionEtxt' : 'RegionFtxt';
    var parentTxt = isEnglish() ? 'OrganizationNameEtxt' : 'OrganizationNameFtxt';

    var args = {
        formId: '3da2ae41-c2f0-4b3e-bde2-f248cd87a986',
        id: 'tc_ayorganizationunitid',
        maxReturned: 100,
        translations: 'OrganizationSearchLabels.xml',
        uploadHandler: handleUpload,
        urlPrefix: urlComponents.url + 'Organizations',
        urlSuffix: '&$expand=ParentOrganization,Region&apikey=' + urlComponents.key,
        columns: [
            { data: isEnglish() ? 'OrganizationNameEtxt' : 'OrganizationNameFtxt', label: 'organizationName', filter: 'text' },
            { data: isEnglish() ? 'AcronymElbl' : 'AcronymFlbl', label: 'acronym', filter: 'text' },
            { data: 'Region.' + regionTxt, label: 'region', filter: 'text' },
            { data: 'ParentOrganization.' + parentTxt, label: 'parentOrganization', filter: 'text' }
        ],
        dataSrc: 'value',
        lengthMenu: [
            [10, 25, 50, -1],
            [10, 25, 50, 'All']
        ]
    };

    search = new CoreSearch(args);
}

function handleUpload(organization, callback) {
    tcDirectory.getOrganizationByDirectoryId(organization.OrganizationId, function (org) {
        if (org) {
            if (confirm(search.getLabel('duplicateException'))) {
                window.parent.parent.location = search.getRecordUrl(org);
                return;
            }

            callback();
            return;
        }

        var record = tcDirectory.copyOrganization(organization);
        tcDirectory.addOrganization(record, callback);
    });
}

function isEnglish() {
    return GetGlobalContext().getUserLcid() == 1033;
}
