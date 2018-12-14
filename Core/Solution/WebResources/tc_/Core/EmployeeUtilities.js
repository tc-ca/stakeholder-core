function getOrCreateEmployeeById(userName, callback) {
    /// <summary>The following assumes that the execution context is availble through a global 
    /// variable named context. This function returns an employee record matching the
    /// provided network user name and creates the employee record if it doesn't already 
    /// exist.</summary>
    /// <param name='userName'>The TC network Id of the employee</param>
    /// <param name='callback'>The callback function used to process the results</param>
    var url = context.getContext().getClientUrl();
    url = url + "/XRMServices/2011/OrganizationData.svc/tc_AYEmployeeSet";
    url = url + "?$filter=tc_DomainNameId eq '" + userName + "'";
    $.ajax({
        type: "Get",
        url: url,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, status, req) {
            if (!data.d || !data.d.results) return;
            if (data.d.results.length == 0)
                createEmployeeById(userName, callback);
            else
                callback(data.d.results[0]);
        },
        error: function () { callback(); }
    });
}

function getOrCreateEmployeeByEmail(email, callback) {
    /// <summary>Assumes that the execution context is availble through a global 
    /// variable named context. This function returns an employee record matching the
    /// provided email address and creates the employee record if it doesn't already 
    /// exist.</summary>
    /// <param name='email'>The email address of the employee</param>
    /// <param name='callback'>The callback function used to process the results</param>
    var url = context.getContext().getClientUrl();
    url = url + "/XRMServices/2011/OrganizationData.svc/tc_AYEmployeeSet";
    url = url + "?$filter=emailaddress eq '" + email + "'";
    $.ajax({
        type: "Get",
        url: url,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, status, req) {
            if (!data.d || !data.d.results) return;
            if (data.d.results.length == 0)
                createEmployeeByEmail(email, callback);
            else
                callback(data.d.results[0]);
        },
        error: function () { callback(); }
    });
}

function createEmployeeById(userName, callback) {
    /// <summary>The following assumes that the execution context is availble through a global 
    /// variable named context. This function attempts to create an employee record with 
    /// the provided network user name, returning null if the employee has already been 
    /// added.</summary>
    /// <param name='userName'>The TC network Id of the employee</param>
    /// <param name='callback'>The callback function used to process the results</param>
    var employee = {};
    employee.tc_DomainNameId = userName;
    var url = context.getContext().getClientUrl();
    url = url + "/XRMServices/2011/OrganizationData.svc/tc_AYEmployeeSet";
    $.ajax({
        type: "Post",
        url: url,
        data: JSON.stringify(employee),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XMLHttpRequest) { callback(data.d); },
        error: function () { callback(); }
    });
}

function createEmployeeByEmail(email, callback) {
    /// <summary>The following assumes that the execution context is availble through a global 
    /// variable named context. This function attempts to create an employee record with 
    /// the provided network user name, returning null if the employee has already been 
    /// added.</summary>
    /// <param name='email'>The email address of the employee</param>
    /// <param name='callback'>The callback function used to process the results</param>
    var employee = {};
    employee.emailaddress = email;
    var url = context.getContext().getClientUrl();
    url = url + "/XRMServices/2011/OrganizationData.svc/tc_AYEmployeeSet";
    $.ajax({
        type: "Post",
        url: url,
        data: JSON.stringify(employee),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XMLHttpRequest) { callback(data.d); },
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
        dataType: "json",
        success: function (data) { callback(data.d); },
        error: function () { callback(null); }
    });
}

function getEmployeeByGuid(id, callback) {
    /// <summary>Retrieves a specific employee by Id. Requires use of the global context.</summary>
    /// <param name='id'>The GUID of the employee record.</param>
    /// <param name='callback'>The callback function used to process results.</param>var userId = GetGlobalContext().getUserId().toString();
    var url = GetGlobalContext().getClientUrl() + "/XRMServices/2011/OrganizationData.svc/tc_AYEmployeeSet(guid'" + id + "')";
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function (data) { callback(data.d); },
        error: function () { callback(null); }
    });
}
