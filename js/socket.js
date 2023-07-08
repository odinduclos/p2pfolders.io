var socket = io();
var socket_id = false;

socket.on('display_error', function (data) {
    $("#comm_errors .info").html(data.error).parent().show(1).delay(5000).hide(1);
    aff_page("users");
});

socket.on('get_id', function (data) {
    socket_id = data;
    initiate_client_connexion(socket_id);
});

socket.on('ask_file', function (data) {
    initiate_server_connexion(data);
});

socket.on("change_secret", function (data) {
    if (data.error === true) {
        $("#comm_errors .info").html("Username already taken, your secret has been changed to " + data.user.secret + " temporary.").parent().show(1).delay(5000).hide(1);
        $("#account_error_duplicate").show(1).delay(3000).hide(1);
        $("#save_account_button").attr("disabled", "disabled");
    } else {
        localStorage.setItem("account", JSON.stringify({pseudo: data.user.pseudo, secret: data.user.secret}));
        $("#account_success").show(1).delay(3000).hide(1);
    }
    account.pseudo = data.user.pseudo;
    account.secret = data.user.secret;
    $("#account_pseudo").val(data.user.pseudo);
    $("#account_secret").val(data.user.secret);
});

socket.on('download_users', function (data) {
    var user_folder = $("#users-list");
    user_folder.html("");
    if (data.length == 0) {
        $("#users").find(".warning").show("fast");
    } else {
        $("#users").find(".warning").hide();
    }
    for (var i = 0; i < data.length; i++) {
        var user = get_username(data[i]);
        user_folder.append('<li id="user-' + data[i].id + '"><a href="#userfolders/' + user + '" onclick="show_folders(this)" data-user="' + user + '">' + user + '</a> (' + data[i].folders + ' folders and ' + data[i].files + ' files)</li>');
    };
});

socket.on('ask_folders', function (data) {
    send_folders(data);
});
