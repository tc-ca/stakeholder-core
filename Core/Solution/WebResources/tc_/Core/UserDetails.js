function getUserRecord(userId, callback) {
    /// <summary>The following assumes that the execution context is availble through a global 
    /// variable named context. This function simply returns the SystemUser record.</summary>
    /// <param name='userId'>The GUID of the user to retrieve<param>
    /// <param name='callback'>The callback function used to process the results</param>
    var url = context.getConext().getClientUrl();
    url = url + "/api/data/v8.2/SystemUsers?$top=1&$filter=SystemUserId eq guid'";
    url = url + userId;
    url = url + "'";
    $.ajax({
        type: "Get",
        async: false,
        url: url,
        beforeSend: function (XMLHttpRequest) { 
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            if (!data || !data.d || !data.d.results || data.d.results.length == 0) callback();
            else callback(data.d.results[0]);
        },
        error: function() { callback(); }
    });
}

function getUserOrganization(userId, callback) {
    /// <summary>The following assumes that the execution context is availble through a global 
    /// variable named context. This function simply returns the EntityReference object
    /// representing the organization unit that the user with the specified GUID belongs
    /// to.</summary>
    /// <param name='userId'>The GUID of the user<param>
    /// <param name='callback'>The callback function used to process the results</param>
    var url = context.getContext().getClientUrl();
    url = url + "/XRMServices/2011/OrganizationData.svc/SystemUserSet?$top=1&$filter=SystemUserId eq guid'";
    url = url + userId;
    url = url + "'&$expand=tc_EmployeeId/tc_ayorganizationunit_ayemployee_OrganizationId";
    $.ajax({
        type: "Get",
        url: url,
        beforeSend: function (XMLHttpRequest) { 
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            if (!data || !data.d || !data.d.results || data.d.results.length == 0) callback();
            else callback(data.d.results[0].tc_OrganizationUnit_SystemUser);
        },
        error: function () { callback(); }
    });
}

function getUserTeams(userId, callback) {
    /// <summary>The following assumes that the execution context is availble through a global 
    /// variable named context. This function returns an array of entities each 
    /// containing the GUID and name of all teams the user with the specified GUID is a 
    /// member of.</summary>
    /// <param name='userId'>The GUID of the user<param>
    /// <param name='callback'>The callback function used to process the results</param>
    var teams = [];
    var url = context.getContext().getClientUrl();
    url = url + "/XRMServices/2011/OrganizationData.svc/SystemUserSet?$top=1&$filter=SystemUserId eq guid'";
    url = url + userId;
    url = url + "'&$expand=teammembership_association&$select=teammembership_association/Name,teammembership_association/TeamId";
    $.ajax({
        type: "Get",
        url: url,
        beforeSend: function (XMLHttpRequest) { 
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
        },
        success: function(data){
            for(var i = 0; i < data.d.results[0].teammembership_association.results.length; i++)
                teams.push(data.d.results[0].teammembership_association.results[i]);

            callback(teams);
        },
        error: function () { callback(); }
    });
}

function getUserEmployee(callback) {
    /// <summary>The following assumes that the global context is available and returns the employee record
    /// linked to the logged in user. Requires use of the global context.</summary>
    /// <param name='callback'>The callback function used to process results.</param>

    var userId = GetGlobalContext().getUserId().toString();
    var url = GetGlobalContext().getClientUrl() + "/XRMServices/2011/OrganizationData.svc/SystemUserSet(guid'" + userId + "')/tc_AYEmployee_SystemUser_EmployeeId";
    $.ajax({
        type: "GET",
        url: url,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
        },
        success: function (data) { callback(data.d); },
        error: function () { callback(null); }
    });
}

