(function(){

    var Xrm = window.parent.Xrm;
    var lcid = Xrm.Page.context.getUserLcid();
    var query = getQueryParams();
    var args = JSON.parse(query.data);

    var control = new pca.Address(
        [{ element: 'street-address', field: 'Line1' }],
        { 
            key: 'XX63-UZ89-YE34-TA12',
            languagePreference: lcid == 1033 ? 'eng' : 'fra'
    });

    control.listen('populate', function(address) {
        Xrm.Page.getAttribute(args.prefix + 'city').setValue(address.City);
        Xrm.Page.getAttribute(args.prefix + 'country').setValue(address.CountryName);
        Xrm.Page.getAttribute(args.prefix + 'line1').setValue(address.Line1);
        Xrm.Page.getAttribute(args.prefix + 'line2').setValue(address.Line2);
        Xrm.Page.getAttribute(args.prefix + 'postalcode').setValue(address.PostalCode);
        Xrm.Page.getAttribute(args.prefix + 'stateorprovince').setValue(address.ProvinceName);
        Xrm.Page.getAttribute(args.prefix + 'composite').setValue(address.Label);
    });

    $('[data-label]').each(function () {
        var key = $(this).attr('data-label');
        $(this).text(labels[key][lcid]);
    });

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

})();