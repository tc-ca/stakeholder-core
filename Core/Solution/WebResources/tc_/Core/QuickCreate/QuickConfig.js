function load(config) {
    var cfg = [];

    function getConfig(){
        var url = Xrm.Page.context.getClientUrl() + '/WebResources/tc_/Core/QuickCreate/' + config;
        var req = new XMLHttpRequest();
        req.open('Get', url);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onloadend = initializeQuickCreate;
        req.send();
    }

    function initializeQuickCreate(e) {
        cfg = JSON.parse(e.currentTarget.responseText);
        var roles = Xrm.Page.context.getUserRoles();
        for (var i = 0; i < roles.length; i++)
            processRole(roles[i]);
    }

    function processRole(roleId) {
        var url = Xrm.Page.context.getClientUrl()
            + "/XRMServices/2011/OrganizationData.svc/RoleSet(guid'"
            + roleId + "')?$select=Name";

        var req = new XMLHttpRequest();
        req.open('Get', url);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onloadend = applyRole;
        req.send();
    }

    function applyRole(e) {
        var role = JSON.parse(e.currentTarget.responseText).d.Name;
        var roles = cfg.filter(function (c) { return c.name == role });
        if (roles.length != 1) return;

        var roleCfg = roles[0];
        for (var i = 0; i < roleCfg.controls.length; i++) {
            var control = roleCfg.controls[i];
            Xrm.Page.getAttribute(control.field).controls.forEach(function (c) { c.setVisible(1); });
            Xrm.Page.getAttribute(control.field).setRequiredLevel(control.requiredLevel);
        }
    }

    getConfig();
}
