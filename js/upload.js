// @NEVER save folders in localStorage
// @NEVER export data in JSON
// @NEVER import data in JSON

// @ONCEUPONATIME video and text chat in P2P

// @END tutoriel
// @END about page with howto & aboutme

// @TODO display files and folders number in users list
// @TODO rooms
// @TODO maj users list in real time
// @TODO maj file list in real time

// @TODO maj mustache
// @TODO exporter le zipping sur le client
// @TODO add window.URL.revokeObjectURL(url); on user click 

$('.dropdown-toggle').dropdown();
$('a.navigation').on('click', aonclick);
$('#modal_connexion').modal({show: false});
$('#modal_friends').modal({show: false});
$('[data-toggle="popover"]').popover();
account = get_account();
friends = get_friends();
set_current_page(current_url.substr(1, current_url.length));

dropzone.on("drop", function (e) {
    ondrop(e);
});

files.on("change", function (e) {
    onchoose(this, e);
});
dropzone.on("dragover", function (e) {
    var e = e || event;
    e.stopPropagation();
    e.preventDefault();
});

$("#save-account").on("submit", function (e) {
    e.preventDefault();
    save_account();
});

$("#save-contact").on("submit", function (e) {
    e.preventDefault();
    save_contact();
});

$("#search").on("submit", function (e) {
    e.preventDefault();
    var filter = $("#filter").val();
    if (filter == "") {
        $("li").show();
        return;
    }
    $("li:visible .download").each(function () {
        var text = $(this).text();
        if (text.search(filter) === -1) {
            var parent = $(this).parent();
            if (!parent.data("folder")) {
                parent.hide();
            }
        }
    });  
});

$("#form_account input:text").on("input", function () {
    $("#save_account_button").removeAttr("disabled");
});