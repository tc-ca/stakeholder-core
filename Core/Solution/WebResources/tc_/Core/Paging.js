function Paging(args) {
    var that = this;
    var table = $(args.table);
    var pageSize = args.pageSize;
    var paging = $('<ul class="pagination"></ul>');
    var pages = args.count / 5;
    this.page = args.page ? args.page : 0;
    paging.insertAfter(table);

    this.clear = function () {
        paging.remove();
    }

    function setPage(i) {
        return function (e) {
            that.page = i;
            $('.pagination .active').removeClass('active');
            var rows = $(table).find('tbody tr');
            rows.hide();
            for (var j = 0; j < pageSize; j++)
                $(rows[j + pageSize * i]).show();

            var items = paging.find('li');
            $(items[i]).addClass('active');

            if(args.onPage)
                args.onPage();
        }
    }

    for (var i = 0; i < pages; i++) {
        var a = $('<a class="page-link" href="javascript:;"></a>')
        a.text(i + 1);
        a.on('click', setPage(i));
        var li = $('<li class="page-item">');
        li.append(a);
        paging.append(li);
    }

    paging.find('a').first().addClass('active');
    setPage(that.page)();
}
