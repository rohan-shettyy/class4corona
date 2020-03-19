$(document).ready(function() {
    var name, school, s_class, code;

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    var schools = readCookie('schools').split('%2C')
    var courses = readCookie('courses').split('%2C')
    var codes = readCookie('codes').split('%2C')

    for (i = 0; i < schools.length; i++) {
        var o = new Option(schools[i].replace(/%20/g, " ") + " - " + courses[i], codes[i]);
        /// jquerify the DOM object 'o' so we can use the html method
        $(o).html(schools[i].replace(/%20/g, " ") + " - " + courses[i]);
        $("#class").append(o);
    }

    $("#submit").click(function() {
        name = $("#name").val();
        code = $("#class").val();
        $.post("/joinclass", {
            name: name,
            code: code
        }, function(data) {
            if (data === 'done') {
                alert("class created");
            } else {
                $(location).attr('href', 'class?session=' + code)
            }
        });
    });
});