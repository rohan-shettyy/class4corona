$(document).ready(function() {


    $.get("classlist", function(data) {});

    // Join class cookies
    function readCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    let schools = readCookie('schools').split('%2C');
    let courses = readCookie('courses').split('%2C');
    let codes = readCookie('codes').split('%2C');

    for (i = 0; i < schools.length; i++) {
        let o = new Option(schools[i].replace(/%20/g, " ") + " - " + courses[i], codes[i]);
        /// jquerify the DOM object 'o' so we can use the html method
        $(o).html(schools[i].replace(/%20/g, " ") + " - " + courses[i]);
        $("#class").append(o);
    }

    // Join class request
    $("#joinClassSubmit").click(function() {
        let name = $("#jname").val();
        let code = $("#class").val();
        $.post("/joinclass", {
            name: name,
            code: code
        }, function(data) {
            if (data === 'done') {
                alert("class created");
            } else {
                window.location.replace('/class?session=' + code + '&name=' + name);
            }
        });
    });

    // Create class request
    $("#createClassSubmit").click(function() {
        let name = $("#cname").val();
        let school = $("#school").val();
        let s_class = $("#classname").val();
        let desc = $("#description").val();
        code = Math.floor(100000 + Math.random() * 900000);
        $.post("/createclass", {
            name: name,
            school: school,
            s_class: s_class,
            description: desc,
            code: code
        }, function(data) {
            console.log(data)
            if (data === 'done') {
                alert("class failed to be created");
            } else {
                window.location.replace('/phost?session=' + code);
            }
        });
    });
});