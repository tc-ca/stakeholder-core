(function () {

    var Xrm = window.parent.Xrm;
    var lcid = Xrm.Page.context.getUserLcid();
    var query = getQueryParams();
    var args = JSON.parse(query.data);
    var frame = Xrm.Page.getControl(args.control);
    var field = Xrm.Page.getAttribute(args.field);
    var docs = field.getValue() ? JSON.parse(field.getValue()) : [];
    var rows = [];
    var rdims = new Rdims();
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

    function refresh() {
        $('table').hide();

        rows = [];
        for (var i = 0; i < docs.length; i++)
            rdims.get(docs[i]).then(draw);

        if (docs.length == 0) $('#noDocuments').show();
    }

    function draw(doc) {
        rows.push(doc);
        if (rows.length < docs.length) return;

        rows = rows.sort(function (a, b) { return a.DocumentNumber < b.DocumentNumber; });
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var html = '<tr>';
            html += '<td>' + row.DocumentNumber + '</td>';
            html += '<td>' + row.DocumentName + '</td>';
            html += '<td>' + row.AuthorID + '</td>';
            html += '<td><a href="javascript:;" class="rm">remove</a> | <a target="_new" href="http://mytc/rdims/' + row.DocumentNumber + '">open</a></td>';
            html += '</tr>';

            var element = $(html);
            element.find('.rm').on('click', remove(row.DocumentNumber));
            $('table tbody').append(element);
        }

        drawPaging(0);
        resizeFrame();
        $('table').show();
    }

    function drawPaging(p) {
        paging = new Paging({
            table: $('table')[0],
            pageSize: pageSize,
            count: docs.length,
            onPage: resizeFrame,
            page: p
        });
    }

    function remove(n) {
        return function (args) {
            docs.splice(docs.indexOf(n), 1);
            $(args.target).parents('tr').remove();

            field.setValue(JSON.stringify(docs));
            if (docs.length == 0) {
                $('table').hide();
                $('#noDocuments').show();
            }

            paging.clear();
            drawPaging(paging.page);
            resizeFrame();
        }
    }

    $('table').hide();
    $('#noDocuments').hide();

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

    refresh();

})();
