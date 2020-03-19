$(document).ready(function() {
    var name, school, s_class, description, reqcode;
    $("#submit").click(function() {
        name = $("#name").val();
        school = $("#school").val();
        s_class = $("#classname").val();
        desc = $("#description").val();
        code = Math.floor(100000 + Math.random() * 900000)
        $.post("/createclass", {
            name: name,
            school: school,
            s_class: s_class,
            description: desc,
            code: code
        }, function(data) {
            if (data === 'done') {
                alert("class failed to be created");
            } else {
                $(location).attr('href', 'host?session=' + code)
            }
        });
    });
});