function autocomplete(args) {
    
    var term = '';
    
    var processing = false;
    var element = $('#' + args.element);
    element.attr('autocomplete', 'off');

    var container = $(document.createElement('div'));
    container.addClass('autocomplete-container');
    container.insertAfter(element);

    if (!args.minLength) args.minLength = 2;
    if (!args.delay) args.delay = 2;
    
    function draw(data) {
        clear();
        var items = data;
        if (!document.activeElement || !document.activeElement.id) return;
        if (element.attr('id') != document.activeElement.id) return;

        for (var i = 0; i < items.length; i++) {
            var item = $(document.createElement('div'));
            item.addClass('autocomplete-item');
            item.text(items[i]);
            item.on('mousedown', setContent(items[i]));
            // mousedown instead of click because container blur will trigger and cause the item to be cleared

            container.append(item);
        }

        container.width(element.outerWidth());
        container.show();
    }

    function setContent(text) {
        return function () {
            element.val(text);
            clear();
        }
    }

    function prev() {
        var active = container.find('.autocomplete-active');
        var next = active.prev('.autocomplete-item');
        if (active.length == 0) next = container.find('.autocomplete-item').last();
        else active.removeClass('autocomplete-active');

        next.addClass('autocomplete-active');
        element.val(next.text());
    }

    function next() {
        var active = container.find('.autocomplete-active');
        var next = active.next('.autocomplete-item');
        if (active.length == 0) next = container.find('.autocomplete-item').first();
        else active.removeClass('autocomplete-active');

        next.addClass('autocomplete-active');
        element.val(next.text());
    }

    function select() {
        var active = container.find('.autocomplete-active');
        if (active.length != 0) element.val(active.text());

        clear();
    }

    function clear() {
        processing = false;
        container.empty();
        container.hide();
    }

    element.on('keydown', function (e) {
        if (e.keyCode == 38) {
            prev();
            e.preventDefault();
        }
        else if (e.keyCode == 40) {
            next();
            e.preventDefault();
        }
        else if (e.keyCode == 13) {
            select();
            e.preventDefault();
        }
    });

    element.on('keyup', function (e) {
        if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13) return;
        if (processing) return;
        if (term == e.currentTarget.value) return;

        term = e.currentTarget.value;
        if (term.length < args.minLength) return;

        processing = true;
        window.setTimeout(function () {
            args.src({ term: term, draw: draw });
        }, args.delay);
    });

    element.on('blur', function () { window.setTimeout(clear, 50); });
}