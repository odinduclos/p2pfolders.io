function hide_download (t) {
    $(t).hide("fast");
    var counter = $("#downloads_counter");
    counter.html(parseInt(counter.text()) - 1);
}

function expand() {
    $(this).toggle();
}

function write_on(liste, entry) {
    if (entry.isDirectory)
        liste.prepend("<li>" + icon_folder + spacing + entry.fullPath + "</li>");
    else liste.prepend("<li>" + icon_file + spacing + entry.fullPath + "</li>");
}

function download_file (t) {
    socket.emit('require_file', {file: $(t).data("file"), id: $(t).data("id")});
}

function expand_folder(t) {
    var element = $(t).parent().find("ul:first");
    element.toggle();
    if (element.is(':hidden')) {
        $(t).addClass("glyphicon-folder-close");
        $(t).removeClass("glyphicon-folder-open");
    }
    else {
        $(t).removeClass("glyphicon-folder-close");
        $(t).addClass("glyphicon-folder-open");
    }
}

function get_username (data) {
    var user = "Anonyme";
    if (data.pseudo != "") {
        user = data.pseudo;
    }
    if (data.secret == "") {
        user += "#" + data.id;
    } else {
        user += "#" + data.secret;
    }
    return user;
}

function save_account() {
    account = {};
    var secret = $("#account_secret").val();
    var pseudo = $("#account_pseudo").val();
    if (secret.length < 8) {
        $("#account_error_secret").show(1).delay(3000).hide(1);
        return;
    }
    socket.emit('save_account', {pseudo: pseudo, secret: secret});
    // localStorage.setItem("account", JSON.stringify({pseudo: account.pseudo, secret: account.secret}));
}

function get_account() {
    var account = JSON.parse(localStorage.getItem("account"));
    if (account === null) {
        account = {'pseudo': 'Anonymous', 'secret': socket.id};
    }
    $("#account_pseudo").val(account.pseudo);
    $("#account_secret").val(account.secret);
    socket.emit('save_account', {pseudo: account.pseudo, secret: account.secret});
    return account;
}

function save_contact(contacts) {
    var username = $("#add_friend_username_input").val();
    var diese = username.indexOf('#');
    if (diese === -1 || username.substr(diese, username.length) < 8) {
        $("#add_friend_error_secret").show(1).delay(5000).hide(1);;
        return;
    }
    contacts = JSON.parse(localStorage.getItem("contacts"));
    if (contacts == null) {
        contacts = [];
    }
    friends.push(username);
    var friends_table = $("#friends_table tbody");
    add_friend(friends_table, username);
    localStorage.setItem("friends", JSON.stringify(friends));
    $("#add_friend_success").show(1).delay(3000).hide(1);
}

function remove_contact(t) {
    var friend = $(t).data("friend");
    $(t).parent().parent().hide("fast");
    for (var i = 0; i < friends.length; i++) {
        if (friends[i] == friend) {
            friends.splice(i, 1);
        }
    };
    localStorage.setItem("friends", JSON.stringify(friends));
    $("#add_friend_success").show(1).delay(3000).hide(1);
}

function add_friend(root, data) {
    var friend;
    friend += '<tr>';
    friend += '<td>' + data + '</td>';
    friend += '<td><span class="glyphicon pull-right glyphicon-remove pointer" aria-hidden="true" onclick="remove_contact(this)" data-friend="' + data + '"></span></td>';
    friend += '<tr>';
    root.prepend(friend);
    console.log("salut");
}

function get_friends() {
    var friends = JSON.parse(localStorage.getItem("friends"));
    if (friends == null) {
        friends = [];
    }
    var friends_table = $("#friends_table tbody");
    for (var i = 0; i < friends.length; i++) {
        add_friend(friends_table, friends[i]);
    };
    return friends;
}


function toggle_element (t) {
    $("#" + $(t).data("target")).toggle("fast");
}

function show_user_folders(user) {
    socket.emit('get_folders', {user: user});
    $("#filter_button").removeAttr("disabled");
    $('section').hide();
    $("#userfolders").show();
}

function show_folders (t) {
    show_user_folders($(t).data("user"));
}

function aff_page(section) {
    $("#filter_button").attr("disabled", "disabled");
    $('section').hide();
    if (section.length == 0) {
        section = "home";
    }
    if (section == "users") {
        socket.emit('get_users', friends);
    }
    $("#" + section).show();
    if (section == "myfolders") {
        if (structure.length === 0) {
            $("#" + section + " .warning").show("fast");        
        }
    }
}

function aonclick (e) {
    var section = $(this).data("section");
    aff_page(section);
}


function set_current_page(url) {
    if (url.substr(0, 11) == "userfolders") {
        var user = url.substr(12, url.length);
        show_user_folders(user);
        return;
    }
    aff_page(url);
}