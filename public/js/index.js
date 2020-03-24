function getcookies() {
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

    var schools = readCookie('schools').split(',');
    var courses = readCookie('courses').split(',');
    var codes = readCookie('codes').split(',');

    for (i = 0; i < schools.length; i++) {
        let o = new Option(schools[i].replace(/%20/g, " ") + " - " + courses[i], codes[i]);
        /// jquerify the DOM object 'o' so we can use the html method
        $(o).html(schools[i].replace(/%20/g, " ") + " - " + courses[i]);
        $("#sclass").append(o);
    }
}


$(document).ready(function() {
    // Join class request
    getcookies()
        // Create class request
    document.getElementById("ccode").value = Math.floor(100000 + Math.random() * 900000);
});