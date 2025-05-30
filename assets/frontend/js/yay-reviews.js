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

  const fileInput = document.getElementById("yay-reviews-file-input");
  const grid = document.querySelector(".yay-reviews-picture-card-grid");
  let yayReviewsFilesArr = [];
  let renderedFilesCount = 0;

  function renderThumbnails() {
    // Only render new thumbnails
    for (let i = renderedFilesCount; i < yayReviewsFilesArr.length; i++) {
      const file = yayReviewsFilesArr[i];
      const url = URL.createObjectURL(file);
      const card = document.createElement("div");
      card.className =
        "yay-reviews-thumb-card relative w-24 h-24 rounded-lg border-dashed overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center";
      card.innerHTML = `
        <img src="${url}" class="object-cover w-full h-full p-2 rounded-lg" alt="preview">
        <button type="button" class="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" data-index="${i}">&times;</button>
      `;
      grid.insertBefore(card, grid.lastElementChild);
    }
    renderedFilesCount = yayReviewsFilesArr.length;

    // Hide upload card if max files reached
    const uploadCard = grid.querySelector(".yay-reviews-upload-card");
    if (uploadCard) {
      uploadCard.style.display =
        yayReviewsFilesArr.length >= parseInt(yay_reviews.max_upload_qty)
          ? "none"
          : "flex";
    }
  }

  // Handle delete button clicks
  $(document).on("click", ".yay-reviews-thumb-card button", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const idx = parseInt($(this).data("index"));
    removeFile(idx);
  });

  function removeFile(idx) {
    // Remove the thumbnail element
    const thumbCards = grid.querySelectorAll(".yay-reviews-thumb-card");
    if (thumbCards[idx]) {
      thumbCards[idx].remove();
    }

    // Remove from array
    yayReviewsFilesArr.splice(idx, 1);
    renderedFilesCount--;

    // Update indices for remaining thumbnails
    thumbCards.forEach((card, index) => {
      if (index > idx) {
        const button = card.querySelector("button");
        if (button) {
          button.setAttribute("data-index", index - 1);
        }
      }
    });

    // Update the file input with remaining files
    const dataTransfer = new DataTransfer();
    yayReviewsFilesArr.forEach(function (file) {
      dataTransfer.items.add(file);
    });
    fileInput.files = dataTransfer.files;

    // Show upload card if below max
    const uploadCard = grid.querySelector(".yay-reviews-upload-card");
    if (uploadCard) {
      uploadCard.style.display =
        yayReviewsFilesArr.length >= parseInt(yay_reviews.max_upload_qty)
          ? "none"
          : "flex";
    }
  }

  // Handle file drop functionality
  window.handleFileDrop = function (event) {
    const dropzone = event.currentTarget;
    const accept = dropzone.dataset.accept;
    const files = event.dataTransfer.files;

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

    // Add nonce to form data
    var nonce = $("#yay_reviews_nonce").val();
    if (nonce) {
      $(this).append(
        '<input type="hidden" name="yay_reviews_nonce" value="' + nonce + '">'
      );
    }
  });

  $("#yay-reviews-file-input").on("change", function (event) {
    const dropzone = document.querySelector(".yay-reviews-upload-card");
    const accept = dropzone.dataset.accept;

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
      // Add new files to yayReviewsFilesArr
      files.forEach(function (file) {
        if (
          !yayReviewsFilesArr.some(
            (f) => f.name === file.name && f.size === file.size
          )
        ) {
          // Check if file size is too large before adding to array
          if (file.size > max_upload_size * 1024) {
            alert(
              yay_reviews.file_size_notice
                .replace("%1$s", file.name)
                .replace("%2$s", max_upload_size)
            );
            return;
          }
          yayReviewsFilesArr.push(file);
        }
      });

      // Limit total files
      if (yayReviewsFilesArr.length > max_upload_qty) {
        alert(yay_reviews.file_quantity_notice);
        yayReviewsFilesArr = yayReviewsFilesArr.slice(0, max_upload_qty);
      }

      // Update the file input
      var dataTransfer = new DataTransfer();
      yayReviewsFilesArr.forEach(function (file) {
        dataTransfer.items.add(file);
      });
      fileInput.files = dataTransfer.files;

      renderThumbnails();
    }
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
