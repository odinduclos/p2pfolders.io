if (!window.File && !window.FileReader && !window.FileList && !window.Blob) {
    alert('The File APIs are not fully supported in this browser.');
}

var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand(); // to make it longer
};