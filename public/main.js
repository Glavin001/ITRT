$(document).ready(function() {

    var $available = $('.available');
    var $unavailable = $('.unavailable');

    var $datePicker = $('#date-picker');
    var $hourPicker = $('#hour-picker');
    var $minutePicker = $('#minute-picker');

    var getDate = function() {
        var d = new Date($datePicker.val());
        d.setHours(parseInt($hourPicker.val()));
        d.setMinutes(parseInt($minutePicker.val()));
        return d;
    }

    var refresh = function() {

        var d = getDate();
        var t = d.getTime();

        $.getJSON('/api/buildings/available/' + t)
            .then(function(results) {
                console.log(results);
                $available.empty();

                results.forEach(function(building) {
                    var $li = $('<li/>').text(building._id);
                    $available.append($li);
                });

            });

        $.getJSON('/api/buildings/unavailable/' + t)
            .then(function(results) {
                console.log(results);
                $unavailable.empty();

                results.forEach(function(building) {
                    var ac = building.active_courses[0]

                    // FIXME
                    var msg = '<strong>' + building._id +
                        '</strong> - ' +
                        ac.subject_id + ' ' + ac.course_id +
                        ' ' + ac.title +
                        ' from ' + ac.begin_time.hours +
                        ':' +
                        ac.begin_time.minutes +
                        ' to ' + ac.end_time.hours +
                        ':' + ac.end_time
                        .minutes;

                    var $about = $('<p/>').html(msg);
                    var $li = $('<li/>').append($about);
                    $unavailable.append($li);
                });

            });

    };

    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear() + "-" + (month) + "-" + (day);
    $datePicker.val(today);
    $hourPicker.val(now.getHours());
    $minutePicker.val(now.getMinutes());

    // Bind to change events
    $datePicker.change(refresh);
    $hourPicker.change(refresh);
    $minutePicker.change(refresh);

    refresh();

});