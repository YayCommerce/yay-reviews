jQuery(document).ready(function ($) {
  $(document).on("click", ".yay-reviews-photo", function () {
    var imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    var videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];
    function getFileExtension(fileName) {
      return fileName.split(".").pop().toLowerCase();
    }
    function getMimeType(extension) {
      var mimeTypes = {
        mp4: "video/mp4",
        avi: "video/x-msvideo",
        mov: "video/quicktime",
        wmv: "video/x-ms-wmv",
        flv: "video/x-flv",
        mkv: "video/x-matroska",
        // Add more mappings as needed
      };
      return mimeTypes[extension] || "application/octet-stream";
    }
    var img_photo = $(this).find("img");

    var preview_obj = $(this)
      .closest(".yay-reviews-media")
      .next(".yay-reviews-preview-media");

    var src = img_photo.attr("data-src");
    var ext = getFileExtension(src);
    var mimeType = getMimeType(ext);

    //empty all preview
    $(".yay-reviews-preview-media").html("");
    //remove/add active class
    $(".yay-reviews-photo").removeClass("active");
    $(this).addClass("active");

    if ($.inArray(ext, imageExtensions) !== -1) {
      preview_obj.html('<img src="' + src + '" alt="" />');
    } else if ($.inArray(ext, videoExtensions) !== -1) {
      preview_obj.html(
        '<video width="320" height="240" controls><source src="' +
          src +
          '" type="' +
          mimeType +
          '">Your browser does not support the video tag.</video>'
      );
    }
  });
});
