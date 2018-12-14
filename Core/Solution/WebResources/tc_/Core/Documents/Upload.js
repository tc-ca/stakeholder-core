(function () {

    var Xrm = window.parent.Xrm;
    var lcid = Xrm.Page.context.getUserLcid();
    var query = getQueryParams();
    var args = JSON.parse(query.data);
    var frame = Xrm.Page.getControl(args.control);
    var field = Xrm.Page.getAttribute(args.field);
    var view = Xrm.Page.getControl(args.view);
    var file = {};
    var tcDirectory = new TcDirectory();
    var templates = new TemplateRepository({ onComplete: setDefaults, tcDirectory: tcDirectory, Xrm: Xrm });
    var rdims = new Rdims();

    function getQueryParams() {
        var data = unescape(location.search);
        data = data.substring(data.indexOf('?') + 1, data.length);
        var parameters = data.split("&");
        var pMap = [];
        var parameter = [];
        for (var i = 0; i < parameters.length; i++) {
            parameter = parameters[i].split("=");
            pMap[parameter[0]] = parameter[1];
        }
        return pMap;
    }

    function clearMessage() {
        $('#errorMessage').text('');
        $('#errorMessage').hide();
        $('#successMessage').text('');
        $('#successMessage').hide();
        resizeFrame();
    }

    function fileChange() {
        clearMessage();
        var f = document.getElementById("file").files[0];
        if (f == null) {
            file = {};
            return;
        }

        $('#fileUploadLabel').text(f.name);
        file.fileName = f.name;
        file.date = new Date(f.lastModifiedDate);
        var reader = new FileReader();
        reader.onload = function () {
            var arr = new Uint8Array(this.result);
            var bytes = "";
            for (var i = 0; i < arr.length; i++)
                bytes += String.fromCharCode(arr[i]);

            file.bytes = btoa(bytes);
        }
        reader.readAsArrayBuffer(f);
    }

    function resizeFrame() {
        var o = frame.getObject();
        o.style.height = o.contentDocument.body.scrollHeight + 10 + 'px';
    }

    function setDefaults() {
        var sortedTemplates = [
            templates.default,
            templates.entityDefault,
            templates.userDefault
        ];

        for (var i = 0; i < sortedTemplates.length; i++) {
            if (sortedTemplates[i] == null) continue;

            var t = sortedTemplates[i];
            if (t.tc_defaultsecurityid) $('#security').val(t.tc_defaultsecurityid);
            if (t.tc_defaultlanguageid) $('#language').val(t.tc_defaultlanguageid);
            if (t.tc_documenttxt) $('#description').val(t.tc_documenttxt);
            if (t.tc_classificationlbl) $('#classification').val(t.tc_classificationlbl);
            if (t.tc_defaultopicd) $('#opi').val(t.tc_defaultopicd);
            ////if (t._tc_authorid_value)
            ////    tcDirectory.getById(t._tc_authorid_value, function (author) {
            ////        if (!author) return;
            ////        document.getElementById('authorInput').value = author.tc_domainnameid;
            ////    });
            if (t.tc_documentnamenm) $('#name').val(t.tc_documentnamenm);
        }

        $('#fileUploadLabel').text(labels.uploadDm.fileUploadLabel[lcid]);
    }

    function showError(key, replaceItems) {
        if (!replaceItems) replaceItems = [];

        var errorControl = document.getElementById('errorMessage');
        if (!errorControl) return;

        errorControl.style.display = "block";
        var text = labels.uploadDm[key][lcid];
        for (var i = 0; i < replaceItems.length; i++) {
            text = text.replace("{" + i + "}", replaceItems[i]);
        }

        errorControl.innerText = text;
        resizeFrame();
    }

    function upload() {
        clearMessage();

        file.name = document.getElementById('name').value;
        file.description = document.getElementById('description').value;
        file.language = document.getElementById('language').value;
        file.security = document.getElementById('security').value;
        file.author = document.getElementById('author').value;
        file.opi = document.getElementById('opi').value;
        file.classification = document.getElementById('classification').value;

        rdims.create(file)
            .success(uploadComplete)
            .error(uploadFail);
    }

    function uploadComplete(result) {
        setDefaults();

        var docs = field.getValue() ? JSON.parse(field.getValue()) : [];
        docs.push(result.DocumentNumber);

        field.setValue(JSON.stringify(docs));
        view.getObject().contentWindow.location.reload();
        $('#successMessage').text("Document #" + result.DocumentNumber + " has been saved.");
        $('#successMessage').show();
    }

    function uploadFail(req) {
        // TODO provided sensible error messages
        $('#errorMessage').text(labels.uploadDm.UPLOAD_FAIL_PROFILE[lcid]);
        $('#errorMessage').show();
    }

    $('#loading').css('visibility', 'hidden');

    $(document).ajaxStart(function () {
        $('#loading').css('visibility', 'visible');
    }).ajaxStop(function () {
        $('#loading').css('visibility', 'hidden');
    });

    // Autocomplete
    autocomplete({
        element: 'opi',
        minLength: 2,
        src: function (args) {
            rdims.opis(args.term).then(function (data) {
                args.draw(data.value.map(function (x) { return x.DeptID; }));
            });
        }
    });

    autocomplete({
        element: 'classification',
        minLength: 2,
        src: function (args) {
            rdims.classifications(args.term).then(function (data) {
                args.draw(data.value.map(function (x) { return x.FileNumber; }));
            });
        }
    });

    autocomplete({
        element: 'author',
        minLength: 2,
        src: function (args) {
            tcDirectory.domainNames(args.term).then(function (data) {
                args.draw(data.value.map(function(x) { return x.UserId; }));
            });
        }
    });

    $(window).resize(resizeFrame);

    $('#submit').click(upload);
    $('#file').change(fileChange);

    for (var label in labels.uploadDm)
        $('#' + label).text(labels.uploadDm[label][lcid]);
    
    resizeFrame();
})();
