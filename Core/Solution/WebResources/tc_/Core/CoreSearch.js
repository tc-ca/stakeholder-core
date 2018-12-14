var frame;
var Xrm;
var scripts;
var loaded = 0;

$(document).ready(function () {
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

    init();

    $(document).ajaxStart(function () {
        $('#searchButton').addClass('control-disabled');
        $('#loading').show();
    }).ajaxStop(function () {
        $('#searchButton').removeClass('control-disabled');
        $('#loading').hide();
    });
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

function CoreSearch(args) {
    var that = this;
    var filterTemplate = document.getElementById('filterGroupTemplate');
    var table;
    var filters = [];
    labels = new Translations(args.translations, setLabels);
    coreLabels = new Translations('CoreSearchLabels.xml', setCoreLabels);

    this.getLabel = function (key) {
        if (labels.getLabel(key))
            return labels.getLabel(key);
        if (coreLabels.getLabel(key))
            return coreLabels.getLabel(key);

        return '';
    }

    this.getRecordUrl = function (result) {
        return GetGlobalContext().getClientUrl()
            + '/main.aspx?etn=' + Xrm.Page.data.entity.getEntityName()
            + '&pagetype=entityrecord&extraqs=formid%3d' + args.formId
            + '&id=%7b' + result[args.id].toString() + '%7d';
    }

    this.getTable = function () {
        return table;
    }

    function initializeTable(url) {
        var cols = [];
        for (var i in args.columns) {
            if (args.columns[i].hide) continue;
            cols.push({ data: args.columns[i].data });
        }

        table = $('#data').DataTable(
        {
            ajax: {
                url: url,
                dataSrc: args.dataSrc,
                xhrFields: args.xhrFields
            },
            columns: cols,
            lengthMenu: args.lengthMenu,
            pagingType: 'simple',
            select: 'single'
        });

        table.on('draw.dt', function () {
            window.setTimeout(resizeFrame, 100);
        });

        table.on('select.dt', handleSelect)
        table.on('deselect.dt', handleDeselect)

        $('#data').show();
    }

    function setCoreLabels() {
        $(filterTemplate).find('.filter-label').each(function (i, e) { $(e).text(coreLabels.getLabel('filter')); });
        $(filterTemplate).find('.text-label').each(function (i, e) { $(e).text(coreLabels.getLabel('value')); });
        $(filterTemplate).find('.operator-label').each(function (i, e) { $(e).text(coreLabels.getLabel('operator')); });
        $(filterTemplate).find('.date-label').each(function (i, e) { $(e).text(coreLabels.getLabel('date')); });
        $(filterTemplate).find('.date-validation-label').each(function (i, e) { $(e).text(coreLabels.getLabel('dateValidation')); });
        $(filterTemplate).find('.number-label').each(function (i, e) { $(e).text(coreLabels.getLabel('number')); });
        $(filterTemplate).find('.number-validation-label').each(function (i, e) { $(e).text(coreLabels.getLabel('numberValidation')); });
        $(filterTemplate).find('.select-label').each(function (i, e) { $(e).text(coreLabels.getLabel('select')); });
        
        $(filterTemplate).find('option[value=lt]').each(function (i, e) { $(e).text(coreLabels.getLabel('before')); });
        $(filterTemplate).find('option[value=le]').each(function (i, e) { $(e).text(coreLabels.getLabel('beforeOrOn')); });
        $(filterTemplate).find('option[value=gt]').each(function (i, e) { $(e).text(coreLabels.getLabel('after')); });
        $(filterTemplate).find('option[value=ge]').each(function (i, e) { $(e).text(coreLabels.getLabel('afterOrOn')); });
        $(filterTemplate).find('option[value=eq]').each(function (i, e) { $(e).text(coreLabels.getLabel('on')); });

        $('#searchButton').text(coreLabels.getLabel('search'));
        $('#addButton').text(coreLabels.getLabel('add'));
        $('#addFilterButton').text(coreLabels.getLabel('addFilter'));
    }

    function setLabels() {
        // Filter Options
        var select = $(filterTemplate).find('.filter-select')[0];
        var option;
        for (var i in args.columns) {
            if (!args.columns[i].filter) continue;
            option = document.createElement('option');

            option.value = args.columns[i].data.indexOf('.') > 0
                ? args.columns[i].data.replace(/\./g, '/')
                : args.columns[i].data;
            $(option).addClass('grid-popup-option');
            $(option).addClass('noselect');
            option.innerText = labels.getLabel(args.columns[i].label);
            select.appendChild(option);
        }

        // Table columns
        var headers = document.getElementById('dataHeaders');
        var header;
        var cols = args.columns.filter(function(x) { return !x.hide; });
        for (var i in cols) {
            header = document.createElement('th');
            header.innerText = labels.getLabel(cols[i].label);
            headers.appendChild(header);
        }
    }

    function resizeFrame() {
        var o = frame.getObject();
        o.style.height = o.contentDocument.body.scrollHeight + 10 + 'px';
    }

    function handleFilter(filter) {
        return function () {
            var value = $(filter).find('.filter-select').val();
            var column = getColumn(filter);
            
            $(filter).find('.value-control').hide();
            $(filter).find('.text-input').val('--');
            $(filter).find('.date-input').val('yyyy-MM-dd');
            $(filter).find('.number-input').val('--');
            $(filter).find('.select-input').val('');
            var select = $(filter).find('.select-input')[0];
            while (select.options.length > 1) select.remove(1); // Remove all but '--' option

            if(value) $(filter).find('.' + column.filter + '-control').show();

            if (column && column.filter == 'select') setOptions(filter, column.options);

            resizeFrame();
        }
    }

    function setOptions(filter, options) {
        if (typeof options == 'array') {
            buildOptions(filter, options);
            return;
        }

        $.ajax({
            type: 'GET',
            url: options.url,
            xhrFields: args.xhrFields,
            success: function (data) {
                var values = [];
                for (var i = 0; i < data.value.length; i++) {
                    values.push({
                        text: data.value[i][options.text],
                        value: data.value[i][options.value]
                    });
                }

                buildOptions(filter, values);
            }
        });
    }

    function buildOptions(filter, options) {
        var select = $(filter).find('.select-input')[0];
        for (var i = 0; i < options.length; i++) {
            var option = document.createElement('option');
            option.value = options[i].value;
            option.text = options[i].text;
            select.add(option);
        }
    }

    function handleSearch() {
        if ($(this).hasClass('control-disabled')) return;

        var filter = getFilter();
        var url = "{prefix}?$top={count}&$filter={filter}&{suffix}";
        url = url.replace('{prefix}', args.urlPrefix);
        url = url.replace('{count}', args.maxReturned);
        url = url.replace('{filter}', filter);
        url = url.replace('{suffix}', args.urlSuffix);

        if (!table) {
            initializeTable(url);
            return;
        }

        table.ajax.url(url);
        table.ajax.reload();
    }

    function getFilter() {
        var filter = '';
        for (var i = 0; i < filters.length; i++) {
            var expression = buildFilter(filters[i]);
            if (!expression) continue;

            if (i != 0) filter += ' and ';
            filter += expression;
        }

        return encodeURIComponent(filter);
    }

    function buildFilter(filter) {
        var filterValue = $(filter).find('.filter-select').val();
        var column = getColumn(filter);
        if (column.filter == 'text') {
            var value = $(filter).find('.text-input').val().toLowerCase();
            return 'startswith(tolower(' + filterValue + "),'" + value + "')";
        }
        else if (column.filter == 'date') {
            var operator = $(filter).find('.date-select').val();
            var value = $(filter).find('.date-input').val();
            return filterValue + ' ' + operator + ' ' + value;
        }
        else if (column.filter == 'number') {
            var value = $(filter).find('.number-input').val();
            return filterValue + ' eq ' + value;
        }
        else if (column.filter == 'select') {
            var value = $(filter).find('.select-input').val();
            return filterValue + ' eq ' + "'" + value + "'";
        }
    }

    function handleSelect(e, dt, type, indexes) {
        $('#addButton').show();
        selected = table.row(indexes[0]).data();
        resizeFrame();
    }

    function handleDeselect(e, dt, type, indexes) {
        $('#addButton').hide();
        selected = null;
        resizeFrame();
    }

    function handleAdd() {
        if (!selected) return;

        $('#loading').show();
        args.uploadHandler(selected, function (result) {
            $('#loading').hide();
            if (!result || !result[args.id]) return; // TODO handle errors

            var url = that.getRecordUrl(result);
            window.parent.parent.location = url;
        });
    }

    function handleDateSelect(filter) {
        return function () {
            var dateSelect = $(filter).find('.date-select');
            var dateInput = $(filter).find('.date-input').parent().parent();
            if (dateSelect.val()) {
                dateInput.show();
            }
            else {
                dateInput.hide();
            }

            resizeFrame();
        }
    }

    function handleDateValue(filter) {
        return function (e) {
            var dateInput = $(e.target);
            var valid = isDate(dateInput.val());

            if (!valid) {
                $(filter).find('.date-validation').show();
            }
            else {
                $(filter).find('.date-validation').hide();
            }

            resizeFrame();
        }
    }

    function handleNumberValue(filter) {
        return function (e) {
            var numberInput = $(e.target);
            var valid = !isNaN(numberInput.val());
            if (!valid) {
                $(filter).find('.number-validation').show();
            }
            else {
                $(filter).find('.number-validation').hide();
            }
        }
    }

    function isDate(text) {
        var generalFormat = /[0-9]{4}[-][0-9]{2}[-][0-9]{2}/;
        if (!generalFormat.test(text) && text.length != 10) return false;

        var expr = /[0-9]+/g;
        var matches = text.match(expr);
        if (matches.length != 3) return false;
        if (matches.some(function (x) { return isNaN(Number(x)); })) return false;

        var year = Number(matches[0]);
        var month = Number(matches[1]);
        var day = Number(matches[2]);
        if (year < 1970) return false;
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        return true;
    }

    function initializeFilter(filter) {
        $(filter).find('.text-input').on('blur', function () { if (!$(this).val()) $(this).val('--'); });
        $(filter).find('.text-input').on('focus', function () { if ($(this).val() == '--') $(this).val(''); });
        $(filter).find('.text-input').on('keypress', function (e) { if (e.keyCode != 13) return; $(this).blur(); });
        $(filter).find('.date-input').on('blur', function () { if (!$(this).val()) $(this).val('yyyy-MM-dd'); });
        $(filter).find('.date-input').on('focus', function () { if ($(this).val() == 'yyyy-MM-dd') $(this).val(''); });
        $(filter).find('.date-input').on('keypress', function (e) { if (e.keyCode != 13) return; $(this).blur(); });
        $(filter).find('.date-input').on('change', handleDateValue(filter));
        $(filter).find('.number-input').on('blur', function () { if (!$(this).val()) $(this).val('--'); });
        $(filter).find('.number-input').on('focus', function () { if ($(this).val() == '--') $(this).val(''); });
        $(filter).find('.number-input').on('keypress', function (e) { if (e.keyCode != 13) return; $(this).blur(); });
        $(filter).find('.number-input').on('change', handleNumberValue(filter));
        $(filter).find('.value-control').hide();

        $(filter).find('.filter-select').click(handleFilter(filter));
        $(filter).find('.date-select').click(handleDateSelect(filter));
        $(filter).find('.remove-button').click(handleRemoveFilter(filter));

        handleDateSelect(filter)();
    }

    function handleAddFilter() {
        var filter = filterTemplate.cloneNode(true);
        filter.id = '';
        $(filter).addClass('divider');
        $(filter).find('.remove-button').show();
        $(filter).find('.text-input').val('--');
        $(filter).find('.date-input').val('yyyy-MM-dd');
        filters.push(filter);
        initializeFilter(filter);
        document.getElementById('filterGroups').appendChild(filter);
        resizeFrame();
    }

    function handleRemoveFilter(filter) {
        return function () {
            var filterGroups = document.getElementById('filterGroups');
            filterGroups.removeChild(filter);

            var i = filters.indexOf(filter);
            filters.splice(i, 1);
        }
    }

    function getColumn(filter) {
        var value = $(filter).find('.filter-select').val();
        if (value.indexOf('/') != -1) value = value.replace(/\//g, '.');
        return args.columns.filter(function (x) { return x.data == value; })[0];
    }

    filters.push(filterTemplate);
    initializeFilter(filterTemplate);

    $(window).resize(resizeFrame);

    $('#loading').hide();
    $('#data').hide();
    $('#addButton').hide();

    $('#searchButton').click(handleSearch);
    $('#addButton').click(handleAdd);
    $('#addFilterButton').click(handleAddFilter);
}
