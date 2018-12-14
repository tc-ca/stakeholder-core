var frame;
var Xrm;
var scripts;
var loaded = 0;
var coreDtReady;

$(document).ready(function () {

    coreDtReady = new CustomEvent('core-dt.ready');
    coreDtReady.initEvent('core-dt.ready', false, false);

    Xrm = window.parent.Xrm;
    var parameters = getQueryParams();
    frame = Xrm.Page.getControl(parameters.control)
    scripts = JSON.parse(parameters.scripts);

    for (var i in scripts) {
        e = document.createElement('script');
        e.type = "text/javascript";
        e.src = scripts[i];
        e.onload = load;
        document.head.appendChild(e);
    }
});

function load() {
    loaded++;
    if (loaded != scripts.length) return;

    $(document).ajaxStart(function () {
        $('#loading').show();
    }).ajaxStop(function () {
        $('#loading').hide();
    });

    document.dispatchEvent(coreDtReady);
}

function getQueryParams() {
    var data = unescape(location.search);
    data = data.substring(6, data.length);
    var parameters = data.split("&");
    var pMap = [];
    var parameter = [];
    for (var i = 0; i < parameters.length; i++) {
        parameter = parameters[i].split("=");
        pMap[parameter[0]] = parameter[1];
    }
    return pMap;
}

function DataTableView(args) {
    var that = this;
    var table;

    this.getTable = function () {
        return table;
    }

    this.more = function (ajaxArgs, handleRetrieve) {
        ajaxArgs.success = loadMore(handleRetrieve);
        table.off('page.dt');
        table.on('page.dt', function () {
            var pageInfo = table.page.info();
            if (pageInfo.page == pageInfo.pages - 1) {
                $.ajax(ajaxArgs);
            }
        });
    }

    this.noMore = function () {
        table.off('page.dt');
    }

    function initializeTable() {
        var cols = [];
        for (var i in args.columns) cols.push({ data: args.columns[i].data });
        setLabels();

        table = $('#data').DataTable({
            ajax: {
                url: args.url,
                data: args.data,
                cache: true, // data tables sets this to false and causes dyanmics API to reject
                dataSrc: args.dataSrc,
                xhrFields: args.xhrFields
            },
            columns: cols,
            lengthMenu: args.lengthMenu,
            order: args.order,
            pagingType: 'simple'
        });

        table.on('draw.dt', function () {
            window.setTimeout(resizeFrame, 100);
        });
    }

    function loadMore(handleRetrieve) {
        return function (data) {
            var page = table.page.info().pages;
            data = handleRetrieve(data, table.page.info().recordsTotal);

            for (var i = 0; i < data.length; i++)
                table.row.add(data[i]);

            table.draw(false);
        };
    }

    function setLabels() {
        // Table columns
        var headers = document.getElementById('dataHeaders');
        var header;
        for (var i in args.columns) {
            header = document.createElement('th');
            header.innerText = args.columns[i].label;
            headers.appendChild(header);
        }
    }

    function resizeFrame() {
        var o = frame.getObject();
        o.style.height = o.contentDocument.body.scrollHeight + 10 + 'px';
    }

    $(window).resize(resizeFrame);
    $('#loading').hide();
    initializeTable();
}
