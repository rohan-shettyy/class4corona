$(document).ready(function() {
    var name, school, s_class, code;
    $("#submit").click(function() {
        name = $("#name").val();
        school = $("#school").val();
        s_class = $("#class").val();
        code = $("#code").val();
        $.post("/joinclass", {
            name: name,
            school: school,
            s_class: s_class,
            code: code
        }, function(data) {
            if (data === 'done') {
                alert("class created");
            }
        });
    });
});