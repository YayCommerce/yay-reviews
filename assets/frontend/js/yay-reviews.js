jQuery(document).ready(function ($) {
  // Helper function to validate file type
  function isValidFileType(file, acceptTypes) {
    const fileType = file.type;
    return acceptTypes.split(",").some((type) => {
      const trimmedType = type.trim();
      // Handle wildcard types like 'video/*'
      if (trimmedType.endsWith("/*")) {
        const category = trimmedType.split("/")[0];
        return fileType.startsWith(category + "/");
      }
      return fileType === trimmedType;
    });
  }

  // Handle file drop functionality
  window.handleFileDrop = function (event) {
    const dropzone = event.currentTarget;
    const accept = dropzone.dataset.accept;
    const files = event.dataTransfer.files;
    const fileInput = document.getElementById("yay-reviews-file-input");
    const loadingSpinner = document.querySelector(".loading-spinner");
    const uploadText = document.querySelector(".upload-text");
    const uploadLabel = document.querySelector(
      'label[for="yay-reviews-file-input"]'
    );

    // Create a new FileList object
    const dataTransfer = new DataTransfer();
    let hasValidFiles = false;

    // Check each file's type
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if file type is accepted
      if (isValidFileType(file, accept)) {
        dataTransfer.items.add(file);
        hasValidFiles = true;
      } else {
        alert("File type not supported: " + file.name);
      }
    }

    // Only proceed if there are valid files
    if (hasValidFiles) {
      // Show loading state and disable upload
      loadingSpinner.classList.remove("hidden");
      uploadText.classList.add("hidden");
      uploadLabel.classList.add("opacity-50", "cursor-not-allowed");
      fileInput.disabled = true;
      dropzone.classList.add("pointer-events-none");

      // Update the file input with the new files
      fileInput.files = dataTransfer.files;

      // Trigger change event
      const changeEvent = new Event("change", { bubbles: true });
      fileInput.dispatchEvent(changeEvent);
    }
  };

  if (jQuery("#yay-reviews-file-input").closest("form").length) {
    jQuery("#yay-reviews-file-input").closest("form")[0].encoding =
      "multipart/form-data";
  }

  // Add form validation
  $("form.comment-form").on("submit", function (e) {
    // File upload validation
    var fileInput = $("#yay-reviews-file-input");
    if (
      fileInput.length &&
      fileInput.prop("required") &&
      fileInput[0].files.length === 0
    ) {
      e.preventDefault();
      alert(yay_reviews.file_required_notice);
      return false;
    }

    // GDPR validation
    if (
      $("#yay-reviews-gdpr-checkbox").length &&
      !$("#yay-reviews-gdpr-checkbox").is(":checked")
    ) {
      e.preventDefault();
      alert(yay_reviews.gdpr_notice);
      return false;
    }
  });

  let allFiles = [];

  $("#yay-reviews-file-input").on("change", function (event) {
    const dropzone = document.querySelector(".yay-reviews-dropzone");
    const accept = dropzone.dataset.accept;
    const loadingSpinner = document.querySelector(".loading-spinner");
    const uploadText = document.querySelector(".upload-text");
    const uploadLabel = document.querySelector(
      'label[for="yay-reviews-file-input"]'
    );

    var max_upload_qty = parseInt(yay_reviews.max_upload_qty);
    var max_upload_size = parseInt(yay_reviews.max_upload_size);

    var files = Array.from(event.target.files);

    // Filter out invalid file types first
    files = files.filter((file) => {
      if (isValidFileType(file, accept)) {
        return true;
      } else {
        alert("File type not supported: " + file.name);
        return false;
      }
    });

    // Only proceed if there are valid files
    if (files.length > 0) {
      // Show loading state and disable upload
      loadingSpinner.classList.remove("hidden");
      uploadText.classList.add("hidden");
      uploadLabel.classList.add("opacity-50", "cursor-not-allowed");
      this.disabled = true;
      dropzone.classList.add("pointer-events-none");

      // Add new files to allFiles, avoiding duplicates by name+size
      files.forEach(function (file) {
        if (
          !allFiles.some((f) => f.name === file.name && f.size === file.size)
        ) {
          allFiles.push(file);
        }
      });

      // Limit total files
      if (allFiles.length > max_upload_qty) {
        alert(yay_reviews.file_quantity_notice);
        allFiles = allFiles.slice(0, max_upload_qty);
      }

      // Check file sizes
      var hasInvalidSize = false;
      allFiles.forEach(function (file) {
        if (file.size > max_upload_size * 1024) {
          alert(
            yay_reviews.file_size_notice
              .replace("%1$s", file.name)
              .replace("%2$s", max_upload_size)
          );
          hasInvalidSize = true;
        }
      });

      if (hasInvalidSize) {
        allFiles = allFiles.filter(
          (file) => file.size <= max_upload_size * 1024
        );
      }

      // Update the file input
      var dataTransfer = new DataTransfer();
      allFiles.forEach(function (file) {
        dataTransfer.items.add(file);
      });
      $("#yay-reviews-file-input")[0].files = dataTransfer.files;

      // Update thumbnails
      var thumbnailsContainer = $(".yay-reviews-thumbnails");
      thumbnailsContainer.empty();

      // Create an array of promises for thumbnail generation
      const thumbnailPromises = allFiles.map(function (file) {
        return new Promise((resolve) => {
          if (file.type.startsWith("image/")) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var thumbnail = $('<div class="yay-reviews-thumbnail">')
                .append($("<img>").attr("src", e.target.result))
                .append(
                  $('<span class="delete-icon">&times;</span>')
                    .data("name", file.name)
                    .data("size", file.size)
                );
              thumbnailsContainer.append(thumbnail);
              resolve();
            };
            reader.readAsDataURL(file);
          } else if (file.type.startsWith("video/")) {
            var video = document.createElement("video");
            video.preload = "metadata";

            video.onloadedmetadata = function () {
              window.URL.revokeObjectURL(video.src);
              video.currentTime = 1;
            };

            video.onseeked = function () {
              var canvas = document.createElement("canvas");
              canvas.width = 100;
              canvas.height = 100;
              var ctx = canvas.getContext("2d");
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              var thumbnail = $('<div class="yay-reviews-thumbnail">')
                .append($("<img>").attr("src", canvas.toDataURL()))
                .append(
                  $('<span class="delete-icon">&times;</span>')
                    .data("name", file.name)
                    .data("size", file.size)
                );

              thumbnailsContainer.append(thumbnail);
              resolve();
            };

            video.src = URL.createObjectURL(file);
          } else {
            resolve();
          }
        });
      });

      // Hide loading state when all thumbnails are generated
      Promise.all(thumbnailPromises).then(() => {
        setTimeout(() => {
          loadingSpinner.classList.add("hidden");
          uploadText.classList.remove("hidden");
          uploadLabel.classList.remove("opacity-50", "cursor-not-allowed");
          document.getElementById("yay-reviews-file-input").disabled = false;
          dropzone.classList.remove("pointer-events-none");
        }, 1000);
      });
    }
  });

  $(document).on("click", ".yay-reviews-thumbnails .delete-icon", function (e) {
    e.stopPropagation();
    const name = $(this).data("name");
    const size = $(this).data("size");
    allFiles = allFiles.filter((f) => !(f.name === name && f.size === size));
    // Update thumbnails
    var thumbnailsContainer = $(".yay-reviews-thumbnails");
    thumbnailsContainer.empty();
    allFiles.forEach(function (file, index) {
      if (file.type.startsWith("image/")) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var thumbnail = $('<div class="yay-reviews-thumbnail">')
            .append($("<img>").attr("src", e.target.result))
            .append(
              $('<span class="delete-icon">&times;</span>')
                .data("name", file.name)
                .data("size", file.size)
            );
          thumbnailsContainer.append(thumbnail);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        var video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = function () {
          window.URL.revokeObjectURL(video.src);
          video.currentTime = 1;
        };

        video.onseeked = function () {
          var canvas = document.createElement("canvas");
          canvas.width = 100;
          canvas.height = 100;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          var thumbnail = $('<div class="yay-reviews-thumbnail">')
            .append($("<img>").attr("src", canvas.toDataURL()))
            .append(
              $('<span class="delete-icon">&times;</span>')
                .data("name", file.name)
                .data("size", file.size)
            );

          thumbnailsContainer.append(thumbnail);
        };

        video.src = URL.createObjectURL(file);
      }
    });
  });

  $(document).on("click", ".yay-reviews-thumbnail", function () {
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
      .closest(".yay-reviews-photos")
      .next(".yay-reviews-preview-photo");

    var src = img_photo.attr("data-src");
    var ext = getFileExtension(src);
    var mimeType = getMimeType(ext);

    //empty all preview
    $(".yay-reviews-preview-photo").html("");
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
