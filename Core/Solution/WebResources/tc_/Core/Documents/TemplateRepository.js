function TemplateRepository(args) {
    var that = this;
    var context = GetGlobalContext();
    var serviceUrl = context.getClientUrl() + "/api/data/v8.2/tc_dydocumentprofiletemplates";
    var lcid = context.getUserLcid().toString();
    var userId = context.getUserId().toString();
    var entity = args.Xrm.Page.data.entity.getEntityName();

    this.default = null;
    this.userDefault = null;
    this.entityDefault = null;

    function getUserDefault(lcid) {
        $.ajax({
            type: "GET",
            url: serviceUrl + "?$filter=tc_templatecd eq '" + userId.substr(1, userId.length - 2) + ":" + lcid + ":" + entity + "'",
            beforeSend: beforeSend,
            success: function (data) {
                if (data.value.length == 0 && lcid == "0") return;
                if (data.value.length == 0) {
                    getUserDefault("0");
                    return;
                }

                that.userDefault = data.value[0];
                if (args.onComplete) args.onComplete();
            }
        });
    }

    function getEntityDefault(lcid) {
        $.ajax({
            type: "GET",
            url: serviceUrl + "?$filter=tc_templatecd eq '" + lcid + ":" + entity + "'",
            beforeSend: beforeSend,
            success: function (data) {
                if (data.value.length == 0 && lcid == "0") return;
                if (data.value.length == 0) {
                    getEntityDefault("0");
                    return;
                }

                that.entityDefault = data.value[0];
                if (args.onComplete) args.onComplete();
            }
        });
    }

    function beforeSend(req) {
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json: charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
    }

    getUserDefault(lcid);
    getEntityDefault(lcid);

    ////args.tcDirectory.getUserEmployee(function (employee) {
    ////    that.default = {};
    ////    that.default.tc_ClassificationLbl = '';
    ////    that.default.tc_DefaultSecurityId = { Value: 1 };
    ////    that.default.tc_DefaultDescriptionTxt = '';
    ////    that.default.tc_DocumentNameNm = '';
    ////    that.default.tc_DefaultLanguageId = lcid == "1033" ? { Value: 1 } : { Value: 2 };

    ////    if (!employee) {
    ////        if (args.onComplete) args.onComplete();
    ////        return;
    ////    }
        
    ////    that.default.tc_AuthorId = employee.tc_DomainNameId;
    ////    that.default.tc_DefaultOpiCd = employee.tc_MailStopCd;

    ////    if (args.onComplete) args.onComplete();
    ////});

    that.default = {};
    that.default.tc_ClassificationLbl = '';
    that.default.tc_DefaultSecurityId = { Value: 1 };
    that.default.tc_DefaultDescriptionTxt = '';
    that.default.tc_DocumentNameNm = '';
    that.default.tc_DefaultLanguageId = lcid == "1033" ? { Value: 1 } : { Value: 2 };
}
