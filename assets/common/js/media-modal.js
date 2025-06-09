jQuery(document).ready(function ($) {
  // Open modal when clicking on media
  $(".yay-reviews-media").on("click", function () {
    const mediaType = $(this).data("type");
    const mediaSrc = $(this).find("img").data("src");
    const commentId = $(this).data("comment-id");
    const mediaIndex = $(this).data("index");

    // get modal with comment id
    const modal = $(
      `.yay-reviews-preview-media-modal[data-comment-id="${commentId}"]`
    );

    const backdrop = $(
      `.yay-reviews-modal-backdrop[data-comment-id="${commentId}"]`
    );

    const thumbnail = modal.find(
      ".yay-reviews-modal-media-frame-content .thumbnail"
    );

    if (mediaType === "video") {
      thumbnail.html(
        `<video class='yay-reviews-modal-media-item' controls><source src="${mediaSrc}" type="video/mp4">Your browser does not support the video tag.</video>`
      );
    } else {
      thumbnail.html(
        `<img class='yay-reviews-modal-media-item' src="${mediaSrc}" alt="Media preview">`
      );
    }

    const commentMediasPreview = modal.find(
      `.yay-reviews-modal-comment-medias-preview-item[data-index = '${mediaIndex}']`
    );
    commentMediasPreview.addClass("active");

    modal.fadeIn(300);
    backdrop.fadeIn(300);
  });

  // Close modal when clicking the close button
  $(".yay-reviews-modal-close").on("click", function () {
    closeModal();
  });

  // Close modal when clicking outside the content
  $(".yay-reviews-modal-backdrop").on("click", function (e) {
    console.log("click");
    closeModal();
  });

  // Close modal with escape key
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  function closeModal() {
    $(".yay-reviews-preview-media-modal").fadeOut(300);
    $(".yay-reviews-modal-backdrop").fadeOut(300);
    $(".yay-reviews-modal-comment-medias-preview-item").removeClass("active");
  }

  $(".yay-reviews-modal-comment-medias-preview-item").on("click", function () {
    const mediaSrc = $(this).find("img").data("src");
    const commentId = $(this)
      .closest(".yay-reviews-preview-media-modal")
      .data("comment-id");
    const mediaType = $(this).data("type");

    console.log("mediaSrc", mediaSrc);
    console.log("commentId", commentId);
    console.log("mediaType", mediaType);

    const modal = $(
      `.yay-reviews-preview-media-modal[data-comment-id="${commentId}"]`
    );
    const thumbnail = modal.find(
      ".yay-reviews-modal-media-frame-content .thumbnail"
    );

    if (mediaType === "video") {
      thumbnail.html(
        `<video class='yay-reviews-modal-media-item' controls><source src="${mediaSrc}" type="video/mp4">Your browser does not support the video tag.</video>`
      );
    } else {
      thumbnail.html(
        `<img class='yay-reviews-modal-media-item' src="${mediaSrc}" alt="Media preview">`
      );
    }

    $(".yay-reviews-modal-comment-medias-preview-item").removeClass("active");
    $(this).addClass("active");
  });
});
