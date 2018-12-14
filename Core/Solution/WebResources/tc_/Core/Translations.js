function Translations(fileUrl, onComplete) {
    /// <summary>Accepts an array of elements and searches for appropriate translation strings
    /// in the .csv file at the specified location. Makes strings available for future use.</summary>
    /// <param name='fileUrl' type='String'>The location of the file containing translation strings</param>
    /// <param name='eArray' type='Array[String]'>The DOM id values of the labels on a page</param>
    this.getLabel = function (s, l) {
        if (!l) l = lcid;

        if (labels[s] && labels[s][l]) return labels[s][l];
        return null;
    }

    var labels = [];
    var lcid;

    if (typeof GetGlobalContext == 'undefined') lcid = context.getContext().getUserLcid().toString();
    else lcid = GetGlobalContext().getUserLcid().toString();

    function parseData(d) {
        labels = [];
        rows = d.split("\r\n");
        for (var i = 0; i < rows.length - 1; i++) {
            rows[i] = rows[i].split("\t");
        }

        for (var i = 1; i < rows.length - 1; i++) { // ignore header and last (empty) row
            var label = {};
            for (var j = 1; j < rows[0].length; j++) {
                label[rows[0][j]] = rows[i][j];
            }

            labels[rows[i][0]] = label;
        }

        setLabels();
    }

    function setLabels() {
        for (var prop in labels)
            setLabel(document.getElementById(prop));
    }

    function setLabel(e) {
        if (!e || !labels[e.id] || !labels[e.id][lcid]) return;
            e.innerText = labels[e.id][lcid];
    }

    $.ajax({
        type: "GET",
        url: fileUrl,
        dataType: "text",
        success: function (data) {
            parseData(data);
            if (onComplete) onComplete();
        }
    });
}
