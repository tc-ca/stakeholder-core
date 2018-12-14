var tcDirectory;
var search;

function init() {
    tcDirectory = new TcDirectory(GetGlobalContext().getClientUrl());
    var urlComponents = tcDirectory.getUrlComponents();

    var args = {
        dataSrc: 'value',
        formId: 'a84624fd-6b21-4960-9408-9a8ea3084a1d',
        id: 'tc_ayemployeeid',
        maxReturned: 100,
        translations: 'EmployeeSearchLabels.xml',
        uploadHandler: handleUpload,
        urlPrefix: urlComponents.url + 'CurrentClients',
        urlSuffix: '$expand=Organization&apikey=' + urlComponents.key,
        columns: [
            { data: 'NameGivenNm', label: 'firstName', filter: 'text' },
            { data: 'NameSurnameNm', label: 'lastName', filter: 'text' },
            { data: 'EmailAddressTxt', label: 'email', filter: 'text' },
            { data: 'UserId', label: 'networkId', filter: 'text' },
            { data: isEnglish() ? 'Organization.OrganizationNameEtxt' : 'Organization.OrganizationNameFtxt', label: 'organization', filter: 'text' }
        ],
        lengthMenu: [
            [10, 25, 50, -1],
            [10, 25, 50, 'All']
        ]
    };

    search = new CoreSearch(args);
}

function handleUpload(employee, callback) {
    tcDirectory.getByUsername(employee.UserId, function (result) {
        if (result) {
            if (confirm(search.getLabel('duplicateException'))) {
                window.parent.parent.location = search.getRecordUrl(result);
                return;
            }

            callback();
            return;
        }

        var record = tcDirectory.copyAttributes(employee);
        tcDirectory.add(record, callback);
    });
}

function isEnglish() {
    return GetGlobalContext().getUserLcid() == 1033;
}
