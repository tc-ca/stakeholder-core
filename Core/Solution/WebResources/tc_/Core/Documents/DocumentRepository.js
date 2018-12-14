function DocumentRepository(t) {
    var that = this;

    var key = '7023115';
    var serviceUrl = 'https://ncrws478.tc.gc.ca/rais-web/'; // Dev
    ////var serviceUrl = 'https://tcappstest.tc.gc.ca/corp-serv-gen/5/rais-web/'; // Acc
    ////var serviceUrl = 'https://tcapps.tc.gc.ca/corp-serv-gen/5/rais-web/'; // Prod

    var tcDirectory = t;
    var clientUrl;
    if (typeof GetGlobalContext == "undefined") clientUrl = context.getContext().getClientUrl()
    else clientUrl = GetGlobalContext().getClientUrl();

    if (!tcDirectory) tcDirectory = new TcDirectory(clientUrl);

    this.getUrlComponents = function () {
        return { url: serviceUrl, key: key };
    }

    this.get = function (number) {
        var url = serviceUrl + 'Profiles(' + number + ')?apikey=' + key;
        return $.ajax({
            url: url,
            type: 'GET',
            xhrFields: { withCredentials: true }
        });
    }

    this.getDocument = function (number, callback) {
        var url = clientUrl + "/api/data/v8.2/tc_pyrdimsdocuments";
        url = url + "?$filter=tc_rdimsnumbernum eq '" + number + "'";
        $.ajax({
            type: "GET",
            url: url,
            beforeSend: oDataBeforeSend,
            success: function (data, textStatus, req) {
                if (!data.value) {
                    callback();
                    return;
                }

                if (data.value.length == 0)
                    that.getFromRais(number, function (d) {
                        that.add(d, callback);
                    });
                else
                    callback(data.value[0]);
            },
            error: function () {
                callback();
            }
        });
    }

    this.searchClassifications = function (request, response) {
        var text = request.term;
        if (text.length < 2) return;

        var url = serviceUrl + "Classifications('" + text + "')?apikey=" + key;
        $.ajax({
            type: "GET",
            url: url,
            xhrFields: { withCredentials: true },
            success: function (data) {
                var classes = [];
                var results = data.value;
                for (var i = 0; i < results.length; i++)
                    classes.push(results[i].FileNumber);

                response(classes);
            },
            error: function () { }
        });
    }

    this.searchOpis = function (request, response) {
        var text = request.term;
        if (text.length < 2) return;

        var url = serviceUrl + "Opis('" + text + "')?apikey=" + key;
        $.ajax({
            type: "GET",
            url: url,
            xhrFields: { withCredentials: true },
            success: function (data) {
                var opis = [];
                var results = data.value;
                for (var i = 0; i < results.length; i++)
                    opis.push(results[i].DeptID);

                response(opis);
            },
            error: function () { }
        });
    }

    this.uploadToRais = function (d, callback) {
        var url = serviceUrl + "Profiles?apikey=" + key;

        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(d),
            contentType: "text/plain",
            crossDomain: true,
            xhrFields: { withCredentials: true },
            success: function (data) { callback(data); },
            error: function () { callback(); }
        });
    }

    this.updateProfile = function (number, callback) {
        var url = serviceUrl + "Profiles(" + number + ")?apikey=" + key;

        $.ajax({
            type: 'GET',
            url: url,
            xhrFields: { withCredentials: true },
            success: function (data) {
                if (!data.DocumentNumber) {
                    callback(data);
                    return;
                }

                that.getDocument(number, function (record) {
                    var document = that.copyProperties(data);
                    document.tc_PYRdimsDocumentId = record.tc_PYRdimsDocumentId;
                    setAuthor(document, data.AuthorID, function (result) {
                        that.add(result, callback);
                    });
                });
            },
            error: function () { }
        });
    }

    this.copyAttributes = function(profile) {
        return {
            tc_applicationlbl: profile.Application,
            tc_classificationlbl: profile.FileClassification,
            tc_documenttxt: profile.Description,
            tc_documentcreateddte: new Date(profile.CreationDate),
            tc_documentlanguageid: profile.LanguageId,
            tc_documentnamenm: profile.DocumentName,
            tc_documenturllbl: "http://mytc/rdims/" + profile.DocumentNumber,
            tc_opicd: profile.OPI,
            tc_versionnum: profile.TotalVersions,
            tc_versioncommenttxt: profile.VersionComment
        };
    }

    this.getFromRais = function (number, callback) {
        var url = serviceUrl + "Profiles(" + number + ")?apikey=" + key;
        $.ajax({
            type: 'GET',
            url: url,
            xhrFields: { withCredentials: true },
            success: function (data) {
                if (!data.DocumentNumber) {
                    callback(data);
                    return;
                }

                var document = that.copyProperties(data);
                setAuthor(document, data.AuthorID, callback);
            },
            error: function () { }
        });
    }

    this.copyProperties = function (result) {
        var document = {};
        document.tc_applicationlbl = result.Application;
        document.tc_classificationlbl = result.FileClassification;
        document.tc_documenttxt = result.Description;
        document.tc_documentcreateddte = new Date(result.CreationDate);
        document.tc_documentnamenm = result.DocumentName;
        document.tc_documenturllbl = "http://mytc/rdims/" + result.DocumentNumber;
        document.tc_opicd = result.OPI;
        document.tc_versionnum = result.TotalVersions;
        document.tc_versioncommenttxt = result.VersionComment;
        document.tc_rdimsnumbernum = result.DocumentNumber.toString();
        if (result.LanguageId != 0)
            document.tc_documentlanguageid = result.LanguageId;
        if(result.SecurityId != 0)
            document.tc_securitylevelid = result.SecurityId;

        return document;
    }

    this.add = function (d, callback) {
        var url = clientUrl + "/api/data/v8.2/tc_pyrdimsdocuments";
        var method = d.tc_pyrdimsdocumentid ? "PATCH" : "POST";
        if (d.tc_pyrdimsdocumentid)
            url += "(" + d.tcpyrdimsdocumentid + ")";
        
        $.ajax({
            type: method,
            url: url,
            data: JSON.stringify(d),
            beforeSend: oDataPost,
            success: function (data) { callback(data); },
            error: function () { callback(); }
        });
    }

    function setAuthor(d, authorId, callback) {
        tcDirectory.getByUsername(authorId, function (author) {
            if (author == null) {
                callback(d);
                return;
            }
            
            d["tc_AuthorId@odata.bind"] = '/tc_ayemployees(' + author.tc_ayemployeeid + ')';
            callback(d);
        }, true);
    }

    function oDataPost(req) {
        oDataBeforeSend(req);
        req.setRequestHeader("Prefer", "return=representation");
    }

    function oDataBeforeSend(req) {
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
    }
}
