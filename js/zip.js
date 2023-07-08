function deferredAddZip(zip, name, entry) {
    var deferred = $.Deferred();
    entry.file(function (file) {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onloadend = function () {
            var r = zip.file(name, reader.result, {createFolders: true, binary:true, compression : "DEFLATE"});
            deferred.resolve(r);
        }
    });
    return deferred;
}

function waitForZip(deferreds, zip, usezip) {
    $.when.apply($, deferreds).done(function () {
        var blob = zip.generate({type:"blob"});
        usezip(blob);
    }).fail(function (err) {
        console.error(err);
    });
}


function defer_pack_zip(zip, folder, deferreds) {
    for (var i = 0; i < hydrate_structure.length; i++) {
        if (hydrate_structure[i].parent == folder.fullPath) {
            if (!structure[i].isDirectory) {
                deferreds.push(deferredAddZip(zip, hydrate_structure[i].name, structure[i]));
            } else {
                var pointer = zip.folder(hydrate_structure[i].name);
                defer_pack_zip(pointer, structure[i], deferreds);
            }
        }
    };
}