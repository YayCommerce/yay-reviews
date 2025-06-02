jQuery(document).ready(function ($) {
  // Open modal when clicking on media
  $(".yay-reviews-media").on("click", function () {
    const mediaType = $(this).data("type");
    const mediaSrc = $(this).find("img").data("src");
    const modal = $(".yay-reviews-preview-media-modal");
    const modalBody = modal.find(".yay-reviews-modal-body");

    modalBody.empty();

    if (mediaType === "video") {
      modalBody.html(
        `<video controls><source src="${mediaSrc}" type="video/mp4">Your browser does not support the video tag.</video>`
      );
    } else {
      modalBody.html(`<img src="${mediaSrc}" alt="">`);
    }

    modal.fadeIn(300);
  });

  // Close modal when clicking the close button
  $(".yay-reviews-modal-close").on("click", function () {
    $(".yay-reviews-preview-media-modal").fadeOut(300);
  });

  // Close modal when clicking outside the content
  $(".yay-reviews-preview-media-modal").on("click", function (e) {
    if ($(e.target).hasClass("yay-reviews-preview-media-modal")) {
      $(this).fadeOut(300);
    }
  });

  // Close modal with escape key
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".yay-reviews-preview-media-modal").fadeOut(300);
    }
  });
});
