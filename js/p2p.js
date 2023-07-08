var peer = false;

function initiate_client_connexion(socket_id) {
    peer = new Peer(socket_id, {host: window.location.host.replace(/:\d+/, ''), port: 9000, path: '/'});
    peer.on('connection', function (conn) {
        var files = [];
        conn.on('data', function (data) {
            if (data.type == "download") {
                get_blob(files, data);
            } else if (data.type == "get_folders") {
                on_peer_get_folders(data);
            }
        });
    });
}

function initiate_server_connexion(data) {
    var conn = peer.connect(data.id);
    var user = get_username(data.user);
    conn.on('open', function () {
        for (var i = 0; i < structure.length; i++) {
            if (structure[i].fullPath == data.file) {
                $("#comm_success .info").html(user + " is downloading " + structure[i].fullPath + "!").parent().show(1).delay(5000).hide(1);
                if (!structure[i].isDirectory) {
                    structure[i].file(function (blob) {
                        sendparts(conn, user, blob, blob.name, "file");
                    });
                } else {
                    var zip = new JSZip();
                    var deferreds = [];
                    var name = structure[i].name;
                    var pointer = zip.folder(name);
                    defer_pack_zip(pointer, structure[i], deferreds);
                    waitForZip(deferreds, zip, function (blob) {
                        sendparts(conn, user, blob, user + ".zip", "folder");
                    });
                }
            }
        };
    });
}

function send_folders(data) {
    var conn = peer.connect(data.id);
    conn.on('open', function () {
        var user = get_username(account);
        conn.send({type: "get_folders", user: user, folders: hydrate_structure, userid: socket.id});
    });
}

function sendparts(conn, user, file, filename, type) {
    var uint8Array;
    var fileReader = new FileReader();
    var t = token();
    fileReader.onload = function () {
        uint8Array  = new Uint8Array(this.result);
        var len = uint8Array.length;
        for (var i = 0; i < len; i += 1e6) {
            var part = uint8Array.subarray(i, i + 1e6);
            var blob = new Blob([part]);
            conn.send({
                type: "download", 
                user: user, 
                name: filename,
                size: uint8Array.length, 
                part_size: part.length,
                part: (i / 1e6),
                blob: blob, 
                token: t,
                type_file: type
            });
        }
    };
    fileReader.readAsArrayBuffer(file);
}

function on_peer_get_folders(data) {
    $("#user-folders-username").html(data.user);
    var current_section = $("#user-folders-list");
    current_section.find("#root-folder").remove();
    if (data.folders.length == 0) {
        $("#userfolders").find(".warning").show("fast");
    } else {
        $("#userfolders").find(".warning").hide();
    }
    current_section.append('<ul id="root-folder"></ul>');
    for (var i = 0; i < data.folders.length; i++) {
        display_entries(current_section, data.folders[i].path, data.folders[i].name, data.folders[i].parent, data.folders[i].is_dir, data.userid);
    };
}

function set_blob(blob, name, user) {
    var url = window.URL.createObjectURL(blob);
    $('#downloads_menu').append('<li class="navigation" onclick="hide_download(this)"><a target="_blank" href="' + url + '" download="' + name + '">' + user + ' has sent you a new file: ' + name + '</a></li>');
    var counter = $("#downloads_counter");
    counter.html(parseInt(counter.text()) + 1);
    // window.URL.revokeObjectURL(url);
}

function get_blob(files, data) {
    if (typeof(files[data.token]) === "undefined") {
        files[data.token] = {
            blob: [],
            name: data.name,
            size: 0,
            total: data.size,
            user: data.user,
        }
        $("#comm").show("slow");
        $("#comm").append('<div class="progress" id="download-' + data.token + '"><div class="progress-bar" style="width: 0%;"></div></div>');
        $("#comm").append('<div class="info" id="download-info-' + data.token + '">Download ' + data.name + ': <span class="progress-percentage">0%</span> (<span class="progress-size">0</span>/' + Math.round(data.size/1000) + ' ko)</div>');
    }
    var file = files[data.token];
    file.blob.push(data.blob);
    file.size += data.part_size;
    $("#comm #download-" + data.token + " .progress-bar").attr("style", "width: " + (file.size * 100 / file.total) + "%");
    $("#comm #download-info-" + data.token + " .progress-percentage").html(Math.round(file.size * 100 / file.total) + "%");
    $("#comm #download-info-" + data.token + " .progress-size").html(Math.round(file.size / 1000));
    if (file.size >= file.total) {
        $("#comm #download-" + data.token).delay(2000).hide("slow");
        $("#comm #download-info-" + data.token).delay(2000).hide("slow");
        var dataBlob = new Blob(file.blob);
        set_blob(dataBlob, file.name, file.user);
        var d = delete files[data.token];
        console.log(files);
        if (files.length == 0) {
            $("#comm").delay(2000).hide("slow");
        }
    }
}