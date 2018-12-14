(function () {

    var Xrm = window.parent.Xrm;
    var lcid = Xrm.Page.context.getUserLcid();
    var query = getQueryParams();
    var args = JSON.parse(query.data);
    var frame = Xrm.Page.getControl(args.control);
    var view = Xrm.Page.getControl(args.view);
    var field = Xrm.Page.getAttribute(args.field);
    var rdims = new Rdims();
    var tcDirectory = new TcDirectory();
    var docs = [];
    var pageSize = args.pageSize ? args.pageSize : 5;
    var paging;

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

    function resizeFrame() {
        window.setTimeout(function () {
            var o = frame.getObject();
            o.style.height = o.contentDocument.body.scrollHeight + 10 + 'px';
        }, 100);
    }

    function add() {
        getDocs();
        var selected = $('.table-active');
        for (var i = 0; i < selected.length; i++)
            docs.push(Number($(selected[i]).find('td').first().text()));

        selected.removeClass('table-active');
        selected.addClass('table-success');
        selected.off('click');
        selected.off('keypress');

        field.setValue(JSON.stringify(docs));
        view.getObject().contentWindow.location.reload();
    }

    function clear() {
        $('#results').hide();
        $('form').show();
        $('tbody tr').remove();
        paging.clear();
        resizeFrame();
    }

    function draw(result) {
        $('#search').removeClass('disabled');
        getDocs();

        for (var i = 0; i < result.value.length; i++) {
            var doc = result.value[i];
            var html = '<tr tabindex="0">';
            html += '<td>' + doc.DocumentNumber + '</td>';
            html += '<td>' + doc.DocumentName + '</td>';
            html += '<td>' + doc.AuthorID + '</td>';
            html += '<td>' + doc.Application + '</td>';
            html += '</tr>';

            var element = $(html);
            if (docs.indexOf(doc.DocumentNumber) >= 0)
                element.addClass('table-success');
            else {
                element.on('click', select(element));
                element.on('keypress', rowKeyPress(element));
            }

            $('table tbody').append(element);
        }

        paging = new Paging({
            table: $('table')[0],
            pageSize: pageSize,
            count: result.value.length,
            onPage: resizeFrame
        });

        resizeFrame();
        $('form').hide();
        $('#results').show();
    }

    function getDocs() {
        if (!field.getValue()) field.setValue('[]');

        docs = JSON.parse(field.getValue());
    }

    function search() {
        if ($('#search').hasClass('disabled')) return;
        $('#search').addClass('disabled');

        var search = {};
        if ($('#documentNumber').val()) search.DocumentNumber = $('#documentNumber').val();
        if ($('#documentName').val()) search.DocumentName = $('#documentName').val();
        if ($('#author').val()) search.AuthorID = $('#author').val();
        if ($('#opi').val()) search.OPI = $('#opi').val();
        if ($('#application').val()) search.Application = $('#application').val();

        rdims.find(search)
            .success(draw);
    }

    function select(row) {
        return function () {
            if (row.hasClass('table-active')) row.removeClass('table-active');
            else row.addClass('table-active');
        }
    }

    function rowKeyPress(row) {
        return function (e) {
            if (e.keyCode != 13) return;
            select(row)();
        }
    }

    $('.card-link').on('click', function (e) {
        var content = $(e.currentTarget).parent().next();
        if (content.hasClass('collapse')) content.removeClass('collapse');
        else content.addClass('collapse');

        content.find('input,select').val('');
        resizeFrame();
    });

    $('#results').hide();
    $('[data-label]').each(function () {
        var key = $(this).attr('data-label');
        $(this).text(labels.documentSearch[key][lcid]);
    });

    resizeFrame();

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
        element: 'author',
        minLength: 2,
        src: function (args) {
            tcDirectory.domainNames(args.term).then(function (data) {
                args.draw(data.value.map(function (x) { return x.UserId; }));
            });
        }
    });

    $('#search').on('click', search);
    $('#add').on('click', add);
    $('#clear').on('click', clear);
})();
