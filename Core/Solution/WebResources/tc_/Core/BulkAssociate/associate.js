(function () {

    var Xrm = window.parent.Xrm;
    var lcid = Xrm.Page.context.getUserLcid();
    var qr = new QueryReader();
    var args = JSON.parse(qr.data);
    var frame = Xrm.Page.getControl(args.control);
    var grid = Xrm.Page.getControl(args.grid).getGrid();
    var url = Xrm.Page.context.getClientUrl() + '/api/data/v8.2/' + args.relationship;
    var id = Xrm.Page.data.entity.getId();
    id = id.substring(1, id.length - 1);
    var errors = [];
    var total = 0;
    var completed = 0;

    var defaults = {};

    $('#addAll').on('click', function () {

        if (args.defaults) {
            var defaultsDoc = $(Xrm.Page.getControl(args.defaults).getObject().contentDocument);
            if (!defaultsDoc) throw args.defaults + ' is not the name of a valid web resource.';
            defaultsDoc.find('input').each(function () {
                if (this.type == 'checkbox') defaults[this.name] = this.checked;
                else if (this.type == 'text') defaults[this.name] = this.value;
                else if (this.type == 'hidden') defaults[this.name] = this.value;
            });
        }

        associate(grid.getRows());
    });

    $('[data-label]').each(function () {
        var key = $(this).attr('data-label');
        $(this).text(labels.bulkAssociate[key][lcid]);
    });

    $(document).ajaxStart(function () {
        $('#loading').css('visibility', 'visible');
    }).ajaxStop(function () {
        $('#loading').css('visibility', 'hidden');
    });

    window.setInterval(function () {
        var o = frame.getObject();
        o.style.height = $('body').outerHeight() + 'px';
    }, 100);

    function associate(rows) {
        total = rows.getLength();
        errors = [];
        added = 0;
        completed = 0;
        $('.btn').prop('disabled', true);
        for (var i = 0; i < total; i++) {
            var item = {};
            var data = rows.getByIndex(i).getData().entity;
            var dataId = data.getId();
            dataId = dataId.substring(1, dataId.length - 1);
            item[args.gridProperty + '@odata.bind'] = '/' + args.gridCollection + '(' + dataId + ')';
            item[args.formProperty + '@odata.bind'] = '/' + args.formCollection + '(' + id + ')';

            save(item, data.attributes.getByIndex(0).getValue());
        }
    }

    function save(item, display) {
        for (var prop in defaults) {
            item[prop] = defaults[prop];
        }

        var req = $.ajax({
            type: 'POST',
            url: url,
            beforeSend: function (req) {
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.setRequestHeader("OData-MaxVersion", "4.0");
                req.setRequestHeader("OData-Version", "4.0");
            },
            data: JSON.stringify(item)
        }).error(function (data) {
            errors.push({ msg: data.responseJSON.error.message, display: display });
        }).complete(function () {
            completed++;
            if (completed == total) complete();
        });
    }

    function complete() {
        if (errors.length > 0) showErrors();
        if (args.refresh) refreshGrids();

        var added = total - errors.length;
        var successLabel = labels.bulkAssociate.associated[lcid];
        successLabel = successLabel.replace('{n}', added);
        successLabel = successLabel.replace('{m}', total);

        $('.alert-success').text(successLabel);
        $('.alert-success').show().delay(10000).fadeOut(1000);
        $('.btn').prop('disabled', false);
    }

    function refreshGrids() {
        for (var i = 0; i < args.refresh.length; i++) {
            var control = Xrm.Page.getControl(args.refresh[i]);
            if (control) control.refresh();
        }
    }

    function showErrors() {
        $('.alert-danger ul li').remove();
        for (var i = 0; i < errors.length; i++) {
            var li = $('<li>');
            li.text(errors[i].display + ': ' + errors[i].msg);
            $('.alert-danger ul').append(li);
        }

        $('.alert-danger').show().delay(10000).fadeOut(1000);
    }

})();
