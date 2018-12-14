var documentRepository;
var search;

function init() {
    documentRepository = new DocumentRepository();
    var urlComponents = documentRepository.getUrlComponents();
    var applicationsUrl = urlComponents.url + 'Applications?apikey=' + urlComponents.key;

    var args = {
        dataSrc: handleRetrieve,
        formId: '44c7ad37-c3b0-46af-9c70-de740f56dd53',
        id: 'tc_pyrdimsdocumentid',
        maxReturned: 100,
        translations: 'RdimsDocumentSearchLabels.xml',
        uploadHandler: handleUpload,
        urlPrefix: urlComponents.url + 'Profiles',
        urlSuffix: 'apikey=' + urlComponents.key,
        columns: [
            { data: 'DocumentNumber', label: 'documentNumber', filter: 'number' },
            { data: 'DocumentName', label: 'documentName', filter: 'text' },
            { data: 'AuthorID', label: 'author', filter: 'text' },
            { data: 'CreatedBy', label: 'createdBy', filter: 'date', hide: true },
            { data: 'CreationDate', label: 'createdOn', filter: 'date' },
            { data: 'LastEditDate', label: 'editedOn', filter: 'date' },
            { data: 'Application', label: 'application', filter: 'select', options: { url: applicationsUrl, text: 'AppName', value: 'AppName' } }
        ],
        lengthMenu: [
            [10, 25, 50, -1],
            [10, 25, 50, 'All']
        ],
        xhrFields: {
            withCredentials: true
        }
    };

    search = new CoreSearch(args);
}

function handleRetrieve(data) {
    for (var i in data.value) {
        data.value[i].CreationDate = (new Date(data.value[i].CreationDate)).toLocaleDateString();
        data.value[i].LastEditDate = (new Date(data.value[i].LastEditDate)).toLocaleDateString();
    }

    return data.value;
}

function handleUpload(document, callback) {
    documentRepository.getDocument(document.DocumentNumber, function (result) {
        if (result && result.tc_pyrdimsdocumentid) {
            if (confirm(search.getLabel('duplicateException'))) {
                window.parent.parent.location = search.getRecordUrl(result);
                return;
            }

            callback();
        }
    });
}
