// TODO: améliorer la précision de l'arborescence
function display_entries(node, entry_path, entry_name, parent_path, entry_is_directory, id) {
    var id_parent = parent_path.replace(/[^a-zA-Z]/g, '');
    var id_entry = entry_path.replace(/[^a-zA-Z]/g, '');
    var value = '<span class="download" data-file="' + entry_path + '" onclick="download_file(this)" data-id="' + id + '">' + entry_name + '</span>';
    if (id_parent == "") {
        id_parent = "root";
    }
    if (entry_is_directory) {
        value = icon_folder + spacing + value + '<ul id="' + id_entry + '-folder"></ul>';
    } else {
        value = icon_file + spacing + value;
    }
    node.find("#" + id_parent + "-folder").append('<li id="' + id_entry + '" data-folder="' + entry_is_directory + '">' + value + '</li>');
}

function useEntry(entry, structure) {
    if (!entry.isDirectory) {
        entry.file(function (file) {
            entry.myfile = file;
            structure.push(entry);
            count_files.text(parseInt(count_files.text()) + 1);
        });
    } else {
        structure.push(entry);
        count_folders.text(parseInt(count_folders.text()) + 1);
    }
    write_on(logs, entry);
    entry.getParent(function (parent) {
        hydrate_structure.push({path: entry.fullPath, name: entry.name, parent: parent.fullPath, is_dir: entry.isDirectory});
        display_entries(myfolders, entry.fullPath, entry.name, parent.fullPath, entry.isDirectory, socket.id);
    });
}

function readAllEntries(entries) {
    var length = entries.length;
    for (var i = 0; i < length; i++) {
        useEntry(entries[i], structure);
        if (entries[i].isDirectory) {
            var dirReader = entries[i].createReader();
            dirReader.readEntries(readAllEntries);
        }
    };
}

function save_folders() {
    localStorage.setItem("folders", JSON.stringify(structure));
}

function load_folders() {
    structure = JSON.parse(localStorage.getItem("folders"));
}

function ondrop(e) {
    var e = e || event;
    e.stopPropagation();
    e.preventDefault();
    var data = [];
    var length = e.originalEvent.dataTransfer.items.length;
    if (length) {
        $("#myfolders .warning").hide();
    }
    for (var i = 0; i < length; i++) {
        data.push(e.originalEvent.dataTransfer.items[i].webkitGetAsEntry());
    };
    readAllEntries(data);
    setTimeout(function() {
        socket.emit('maj_count_files', {files: count_files.text(), folders: count_folders.text()});
    }, 5000);
}

function onchoose(t, e) {
    if (t.files.length) {
        $("#myfolders .warning").hide();
    }
    for (var i = 0; i < t.files.length; i++) {
        var entry = t.files[i];
        entry.fullPath = '/' + entry.name;
        entry.isDirectory = false;
        entry.file = function (func) {
            func(t);
        };
        structure.push(entry);
        write_on(logs, entry);
        hydrate_structure.push({path: entry.fullPath, name: entry.name, parent: '/', is_dir: entry.isDirectory});
        display_entries(myfolders, entry.fullPath, entry.name, '/', entry.isDirectory, socket.id);
    };
    count_files.text(parseInt(count_files.text()) + 1);
    setTimeout(function() {
        socket.emit('maj_count_files', {files: count_files.text(), folders: 0});
    }, 5000);
}