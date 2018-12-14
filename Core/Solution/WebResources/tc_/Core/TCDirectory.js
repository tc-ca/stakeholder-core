function TcDirectory(clientUrl) {
    /// <summary>Creates a client for making calls to the TC Directory RESTful web API.</summary>
    if (!clientUrl) {
        if (typeof GetGlobalContext != 'undefined') clientUrl = GetGlobalContext().getClientUrl();
        else if (context) clientUrl = context.getContext().getClientUrl();
        else {
            alert('TC Directory client not configured - context unavailable.');
            return;
        }
    }

    var that = this;
    ////var url = "http://amstcappsdev2/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; // Dev
    var url = "https://tcappstest.tc.gc.ca/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; // Acc
    ////var url = "https://tcapps.tc.gc.ca/corp-serv-gen/5/ws-sw/tcd-rtc/v2/"; // Prod
    var key = "f4142218-71e9-473c-b1b7-ae62dbde1275";
    
    var organizationSet = clientUrl + "/api/data/v8.2/tc_ayorganizationunits";
    var employeeSet = clientUrl + "/api/data/v8.2/tc_ayemployees";
    var userSet = clientUrl + '/api/data/v8.2/systemusers';
    
    this.getUrlComponents = function () {
        return {
            url: url,
            key: key
        };
    }

    this.autocomplete = function (request, response) {
        var text = request.term.toLowerCase();
        if (text.length < 2) return;

        var requestUrl = url + "CurrentClients?$filter=startswith(tolower(EmailAddressTxt), '" + text + "') eq true&$top=5&apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                var emails = [];
                for (var i = 0; i < data.value.length; i++)
                    emails.push(data.value[i].EmailAddressTxt);

                response(emails);
            },
            error: function (error) { }
        });
    }

    this.autocompleteNetworkId = function (request, response) {
        if (request.term.length < 2) return;

        var requestUrl = url + "CurrentClients?$filter=startswith(tolower(UserId), '" + request.term.toLowerCase() + "') eq true&$select=UserId&$top=5&apikey=" + key;
        $.ajax({ type: "GET", url: requestUrl })
            .then(function (data) {
                response(data.value.map(function (x) { return x.UserId; }));
        });
    }

    this.get = function (userId) {
        var url = employeeSet + '(' + userId + ')';
        return $.ajax({
            type: 'GET',
            url: url,
            beforeSend: oDataHeaders
        });
    }

    this.getUserEmployee = function (callback) {
        var id = GetGlobalContext().getUserId();
        id = id.substring(1, id.length - 1);
        var url = userSet + "(" + id + ")/tc_EmployeeId";
        $.ajax({
            type: "GET",
            url: url,
            beforeSend: oDataHeaders,
            success: function (data) { callback(data); },
            error: function () { callback(); }
        });
    }

    this.getById = function (id, callback) {
        var requestUrl = employeeSet + "(" + id + ")";
        $.ajax({
            type: 'GET',
            url: requestUrl,
            beforeSend: oDataHeaders,
            success: function (data, status, msg) {
                callback(data);
            },
            error: function () {
                callback();
            }
        });
    }

    this.getOrganizationById = function (id, callback) {
        var requestUrl = organizationSet + "(" + id + ")";
        $.ajax({
            type: 'GET',
            url: requestUrl,
            beforeSend: oDataHeaders,
            success: function (data, status, msg) {
                callback(data.d);
            },
            error: function () {
                callback();
            }
        });
    }

    this.getOrganizationByDirectoryId = function (id, callback) {
        var requestUrl = organizationSet + "?$filter=tc_directoryid eq " + id;
        $.ajax({
            type: 'GET',
            url: requestUrl,
            beforeSend: oDataHeaders,
            complete: function(req, msg) {
                if (req.status != 200) callback();
                else callback(req.responseJSON.value[0]);
            }
        });
    }

    this.getByEmail = function (email, callback, create) {
        var requestUrl = employeeSet + "?$filter=emailaddress eq '" + email + "'";
        $.ajax({
            type: "GET",
            url: requestUrl,
            beforeSend: oDataHeaders,
            complete: function (req, msg) {
                if (req.status != 200 && !create) callback();
                else if (req.status != 200) that.getDirectoryEmployeeEmail(email, callback, create);
                else callback(req.responseJSON.value[0]);
            }
        });
    }

    this.getByUsername = function (username, callback, create) {
        var requestUrl = employeeSet + "?$filter=tc_domainnameid eq '" + username + "'";
        $.ajax({
            type: "GET",
            url: requestUrl,
            beforeSend: oDataHeaders,
            complete: function (req, msg) {
                if (req.responseJSON.value.length == 0 && !create) callback();
                else if (req.responseJSON.value.length == 0) that.getDirectoryEmployee(username, callback, create);
                else callback(req.responseJSON.value[0]);
            }
        });
    }

    this.getDirectoryEmployee = function (username, callback, create) {
        var requestUrl = url + "CurrentClients('"+ username.toUpperCase() +"')?apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                data.IsArchived = false;
                if (!create) {
                    callback(data);
                    return;
                }

                var record = that.copyAttributes(data);
                that.add(record, callback);
            },
            error: function (data) {
                getDirectoryFormerEmployee(username, callback, create);
            }
        });
    }

    this.getDirectoryEmployeeEmail = function (email, callback, create) {
        var requestUrl = url + "CurrentClients?$filter=EmailAddressTxt eq '" + email + "'&apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                if (!data.value || data.value.length == 0) {
                    getDirectoryFormerEmployeeEmail(email, callback, create);
                    return;
                }

                data.value[0].IsArchived = false;
                if (!create) {
                    callback(data.value[0]);
                    return;
                }

                var record = that.copyAttributes(data.value[0]);
                that.add(record, callback);
            },
            error: function () {
                callback();
            }
        });
    }

    this.getDirectoryOrganization = function (id, callback) {
        var requestUrl = url + "Organizations(" + id + ")?apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                if (!data) {
                    getDirectoryFormerOrganization(id, callback);
                    return;
                }

                data.IsArchived = false;
                that.getRegion(data, callback);
            },
            error: function () {
                callback();
            }
        });
    }

    this.getDirectoryChildOrganizations = function (id, callback) {
        var requestUrl = url + "Organizations(" + id + ")/Organizations?apikey=" + key;
        $.ajax({
            type: 'GET',
            url: requestUrl,
            success: function (data, status, msg) {
                if (!data || !data.value || data.value.length == 0) {
                    callback();
                    return;
                }

                for (var i = 0; i < data.value.length; i++)
                    that.getRegion(data.value[i], callback);
            },
            error: function () {
                callback();
            }
        })
    }

    this.copyAttributes = function (employee) {
        return {
            tc_domainnameid: employee.UserId,
            emailaddress: employee.EmailAddressTxt,
            tc_buildingenm: employee.OfficeBuildingEtxt,
            tc_buildingfnm: employee.OfficeBuildingFtxt,
            tc_cityenm: employee.CityEtxt,
            tc_cityfnm: employee.CityEtxt,
            tc_employmentstatuselbl: employee.EmploymentStatusEtxt,
            tc_employmentstatusflbl: employee.EmploymentStatusFtxt,
            tc_faxnum: employee.TelnoFaxTxt,
            tc_firstnamenm: employee.NameGivenNm,
            tc_floorlocationlbl: employee.PhysicalLocationTxt,
            tc_floornumbernum: employee.FloorLocationTxt,
            tc_fullnamenm: employee.NameGivenNm + " " + employee.NameSurnameNm,
            tc_initialsnm: employee.NameInitialsNm,
            tc_lastnamenm: employee.NameSurnameNm,
            tc_mailstopcd: employee.DesignatorCd,
            tc_phonenum: employee.TelnoVoiceExtTxt ? employee.TelnoVoiceTxt + " +" + employee.TelnoVoiceExtTxt : employee.TelnoVoiceTxt,
            tc_postalcodecd: employee.PostalCodeTxt,
            tc_preferredlanguagelbl: employee.LanguageCd,
            tc_provinceenm: employee.ProvinceEtxt,
            tc_provincefnm: employee.ProvinceFtxt,
            tc_salutationlbl: employee.SalutationCd,
            tc_streetaddresselbl: employee.StreetEtxt,
            tc_streetaddressflbl: employee.StreetFtxt,
            tc_titleenm: employee.PositionEtxt,
            tc_titlefnm: employee.PositionFtxt,
            tc_isformeremployeeind: employee.IsArchived
        };
    }

    this.copyOrganization = function (organization) {
        return {
            tc_acronymelbl: organization.AcronymElbl,
            tc_acronymflbl: organization.AcronymFlbl,
            tc_designatorcd: organization.Designator,
            tc_directoryid: organization.OrganizationId,
            tc_faxnum: organization.TelnoFaxTxt,
            tc_nameenm: organization.OrganizationNameEtxt,
            tc_namefnm: organization.OrganizationNameFtxt,
            tc_phonenum: organization.TelnoVoiceExtTxt ? organization.TelnoVoiceTxt + " +" + organization.TelnoVoiceExtTxt : organization.TelnoVoiceTxt,
            tc_regionenm: organization.Region.RegionEtxt,
            tc_regionfnm: organization.Region.RegionFtxt,
            tc_archivedind: organization.IsArchived
        };
    }

    this.add = function (employee, callback) {
        $.ajax({
            type: 'POST',
            url: employeeSet,
            data: JSON.stringify(employee),
            beforeSend: oDataCreateHeaders,
            success: function (data) { callback(data); },
            error: function () { callback(); }
        });
    }

    this.addOrganization = function (organization, callback) {
        $.ajax({
            type: 'POST',
            url: organizationSet,
            data: JSON.stringify(organization),
            beforeSend: oDataCreateHeaders,
            success: function (data) { callback(data); },
            error: function () { callback(); }
        });
    }

    this.updateOrganization = function (organization, callback) {
        var requestUrl = organizationSet + "(" + organization.tc_ayorganizationunitid + ")";
        $.ajax({
            type: 'PATCH',
            url: requestUrl,
            data: JSON.stringify(organization),
            beforeSend: oDataHeaders,
            complete: function (req, msg) {
                if (!callback) return;

                if (req.status == 204) {
                    var eUrl = req.getResponseHeader('OData-EntityId');
                    var id = eUrl.substring(eUrl.indexOf('(') + 1, eUrl.length - 1);
                    callback({ tc_ayorganizationunitid: id });
                    return;
                }

                callback();
            }
        });
    }

    this.getRegion = function (organization, callback) {
        var requestUrl = url + "Organizations(" + organization.OrganizationId + ")/Region?apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                organization.Region = data;
                callback(organization);
            },
            error: function () {
                callback();
            }
        });
    }

    this.getParentOrganization = function (organization, callback) {
        var requestUrl = url + "Organizations(" + organization.OrganizationId + ")/ParentOrganization?apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                organization.ParentOrganization = data;
                callback(organization);
            },
            error: function () {
                callback();
            }
        });
    }

    function getDirectoryFormerEmployee(username, callback, create) {
        var requestUrl = url + "ArchiveClients('" + username.toUpperCase() + "')?apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                if (!data) {
                    callback();
                    return;
                }

                data.IsArchived = true;
                if (!create) {
                    callback(data)
                    return;
                }

                var record = that.copyAttributes(data);
                that.add(record, callback);
            },
            error: function () {
                callback();
            }
        });
    }

    function getDirectoryFormerEmployeeEmail(email, callback, create) {
        var requestUrl = url + "ArchiveClients?$filter=EmailAddressTxt eq '" + email + "'&apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                if (!data.value || data.value.length == 0) {
                    callback();
                    return;
                }

                data.value[0].IsArchived = true;
                if (!create) {
                    callback(data.value[0]);
                    return;
                }

                var record = that.copyAttributes(data.value[0]);
                that.add(record, callback);
            },
            error: function () {
                callback();
            }
        });
    }

    function getDirectoryFormerOrganization(id, callback) {
        var requestUrl = url + "OrganizationsDeleted(" + id + ")?apikey=" + key;
        $.ajax({
            type: "GET",
            url: requestUrl,
            success: function (data) {
                if (!data) {
                    callback();
                    return;
                }

                data.IsArchived = true;
                that.getRegion(data, callback);
            },
            error: function () {
                callback();
            }
        });
    }

    function oDataCreateHeaders(req) {
        oDataHeaders(req);
        req.setRequestHeader("Prefer", "return=representation");
    }

    function oDataHeaders(req) {
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
    }
}
