$(document).ready(function() {
    var name, school, s_class, code;
    var schools = $.cookie('schools').split('%2C')
    var courses = $.cookie('courses').split('%2C')
    var codes = $.cookie('codes').split('%2C')


    for (i = 0; i < schools.length; i++) {
        var o = new Option(schools[i] + courses[i], codes[i]);
        /// jquerify the DOM object 'o' so we can use the html method
        $(o).html(schools[i] + courses[i]);
        $("#class").append(o);
    }

    $("#submit").click(function() {
        name = $("#name").val();
        s_class = $("#class").val();
        code = $("#code").val();
        $.post("/joinclass", {
            name: name,
            s_class: s_class,
            code: code
        }, function(data) {
            if (data === 'done') {
                alert("class created");
            }
        });
    });
});