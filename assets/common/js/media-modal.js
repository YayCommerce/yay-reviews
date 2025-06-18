jQuery(document).ready(function ($) {
  // Helper function to format duration
  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Create video thumbnail for video media
  const videoThumbnails = $(".yay-reviews-video_thumbnail");

  videoThumbnails.each(function () {
    const videoThumbnail = $(this);
    const parent = videoThumbnail.parent();
    const video = document.createElement("video");
    video.src = videoThumbnail.attr("data-src");
    video.preload = "metadata";
    video.onloadedmetadata = function () {
      video.currentTime = 1;
    };
    video.onseeked = function () {
      const canvas = document.createElement("canvas");
      canvas.width = 96; // 6rem = 96px
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL();
      const duration = formatDuration(video.duration);
      videoThumbnail.attr("src", thumbnailUrl);
      let overlay = `
          <span class="inline-block">
            <!-- Play icon SVG -->
            <svg width="20" height="20" fill="white" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6V4z"/></svg>
          </span>
          <span class="text-white text-xs font-semibold pr-1">${
            duration || "0:00"
          }</span>
      `;
      const videoOverlay = $(parent).find(".yay-reviews-video-overlay");
      if (videoOverlay.length > 0) {
        $(videoOverlay[0]).html(overlay);
      }
    };
  });

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
    if ($(this).hasClass("active")) {
      return;
    }

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
