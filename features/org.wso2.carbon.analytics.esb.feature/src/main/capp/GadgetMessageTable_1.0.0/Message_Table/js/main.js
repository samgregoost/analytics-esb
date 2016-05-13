var TOPIC = "subscriber";
var timeFrom;
var timeTo;
var timeUnit = null;
var page = gadgetUtil.getCurrentPage();
var qs = gadgetUtil.getQueryString();
var oTable;

$(function() {
    if (qs[PARAM_ID] == null) {
        $("#canvas").html(gadgetUtil.getDefaultText());
        return;
    }
    timeFrom = gadgetUtil.timeFrom();
    timeTo = gadgetUtil.timeTo();
    console.log("MESSAGE_TABLE[" + page.name + "]: TimeFrom: " + timeFrom + " TimeTo: " + timeTo);

    oTable = $('#tblMessages').DataTable({
        dom: '<"dataTablesTop"' +
             'f' +
             '<"dataTables_toolbar">' +
             '>' +
             'rt' +
             '<"dataTablesBottom"' +
             'lip' +
             '>',
        "processing": true,
        "serverSide": true,
        "columns" : [
                    { title: "Message ID" },
                    { title: "Host" },
                    { title: "Start Time" },
                    { title: "Status" }
        ],
        "ajax": {
            "url" : CONTEXT,
            "data" : function (d) {
                d.id = qs.id;
                d.type = page.type;
                d.timeFrom = timeFrom;
                d.timeTo = timeTo;
                d.entryPoint = qs.entryPoint;
            }
        }
    });

    //Binding custom searching on Enter key press
    $('#tblMessages_filter input').unbind();
    $('#tblMessages_filter input').bind('keyup', function(e) {
    if(e.keyCode == 13) {
        oTable.search( this.value).draw();
    }
    });

    $('#tblMessages').on('click', 'tbody tr', function() {
        var id = $(this).find("td:first").html(); 
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            oTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        if( timeUnit == null) {
            timeUnit = qs.timeUnit;
        }
        // var targetUrl = MESSAGE_PAGE_URL + "?" + PARAM_ID + "=" + id + "&timeFrom=" + timeFrom + "&timeTo=" + timeTo + "&timeUnit=" + timeUnit;;
        var targetUrl = MESSAGE_PAGE_URL + "?" + PARAM_ID + "=" + id;
        parent.window.location = targetUrl;
    });

});

gadgets.HubSettings.onConnect = function() {
    gadgets.Hub.subscribe(TOPIC, function(topic, data, subscriberData) {
        onTimeRangeChanged(data);
    });
};

function onTimeRangeChanged(data) {
    timeFrom = data.timeFrom;
    timeTo = data.timeTo;
    timeUnit = data.timeUnit;

    oTable.clear().draw();
    oTable.ajax.reload().draw();
};

function onData(response) {
    try {
        var data = response.message;
        console.log(data.length); 
        if (data.length <= 0) {
            $("#canvas").html(gadgetUtil.getEmptyRecordsText());
            return;
        }
        $("#tblMessages thead tr").empty();
        $("#tblMessages tbody").empty();
        var columns = page.columns;
        var thead = $("#tblMessages thead tr");
        columns.forEach(function(column) {
            var th = jQuery('<th/>');
            th.append(column.label);
            th.appendTo(thead);
        });

        var tbody = $("#tblMessages tbody");
        data.forEach(function(row, i) {
            var tr = jQuery('<tr/>');
            columns.forEach(function(column) {
                var td = jQuery('<td/>');
                var value = row[column.name];
                td.text(value);
                td.appendTo(tr);

            });
            tr.appendTo(tbody);

        });
        
        dataTable = $('#tblMessages').DataTable({
            dom: '<"dataTablesTop"' +
                'f' +
                '<"dataTables_toolbar">' +
                '>' +
                'rt' +
                '<"dataTablesBottom"' +
                'lip' +
                '>'
        });
    } catch (e) {
        $("#canvas").html(gadgetUtil.getErrorText(e));
    }
};

function onError(msg) {
    $("#canvas").html(gadgetUtil.getErrorText(msg));
};