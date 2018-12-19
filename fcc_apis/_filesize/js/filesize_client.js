/* This section sets up the ajax call to the server. 
This allows the visitor the ability to test the API endpoint 
without having to pass the query into the browser url */

function submitQuery() {
    var message = document.getElementById('message');
    var fileSelect = document.getElementById('fileLoc');
    var files = fileSelect.files;
    
    if (files.length > 0) {
        if (files[0].size < 1048576) {
            var formData = new FormData();
            formData.append('fileUpload', files[0]);
            
            $.ajax({
               url: document.location.origin + '/file/api/',
               type: 'POST',
               data: formData,
               processData: false,  // Absolutely required, otherwise won't send! //
               enctype: 'multipart/form-data',
               contentType: false,  // Must be set to 'false', otherwise the form won't be processed correctly! Can't set to multipart/form-data, and can't ignore! //
               success: function(data) {
                    message.innerHTML = data + " bytes / " + (data/1048576).toFixed(2) + " MB";
               },
               error: function(xhr,status,error) {
                    message.innerHTML = "Error! Unable to send request";
               }
            });
        } else {
            message.innerHTML = files[0].size + " bytes / " + (files[0].size/1048576).toFixed(2) + " MB" +
            "<br><br>Your file is large, so we're validating its size on your end rather than on the server";
        };
    } else {
        message.innerHTML = "No file selected";
    }
}

/* This just binds the ajax call to the button on the page */

var button = document.getElementById("upload");
button.onclick = submitQuery;

/* End of script */