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
      canvas.width = 600; // 6rem = 96px
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL();
      const duration = formatDuration(video.duration);
      videoThumbnail.attr("src", thumbnailUrl);
      let overlay = `
          <span class="inline-block pl-[4px] pt-[4px] pb-[4px]">
            <!-- Play icon SVG -->
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_39_626)">
            <path d="M13.4167 0.504904C13.0636 0.359374 12.6572 0.439757 12.3868 0.70873L10.5865 2.50045V1.40838C10.5865 0.630678 9.95286 0 9.17123 0H1.41532C0.633717 0 0 0.630678 0 1.40838V6.59162C0 7.36932 0.633717 8 1.41532 8H9.17123C9.95286 8 10.5865 7.36932 10.5865 6.59162V5.49951L12.3868 7.29124C12.5678 7.4712 12.8093 7.56685 13.0553 7.56685C13.177 7.56685 13.2998 7.54327 13.4167 7.4951C13.7697 7.34953 14 7.00668 14 6.6263V1.37367C14 0.993287 13.7697 0.650435 13.4167 0.504904ZM6.6517 4.36487L4.72266 5.83976C4.64038 5.90278 4.54091 5.93499 4.44095 5.93499C4.37136 5.93499 4.30149 5.91941 4.23662 5.88758C4.07867 5.81016 3.97867 5.65019 3.97867 5.47489V2.52508C3.97867 2.34974 4.07867 2.18981 4.23662 2.11242C4.39463 2.03492 4.58303 2.05343 4.72263 2.16024L6.65167 3.6351C6.76561 3.72219 6.83237 3.85704 6.83237 3.99997C6.8324 4.14292 6.76565 4.27777 6.6517 4.36487Z" fill="white"/>
            </g>
            <defs>
            <filter id="filter0_d_39_626" x="0" y="0" width="14" height="9" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_39_626"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_39_626" result="shape"/>
            </filter>
            </defs>
            </svg>
          </span>
          <span class="text-white text-xs font-semibold pr-[4px] pt-[4px] pb-[4px]">${
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
        `<video class='yay-reviews-modal-media-item' controls><source src="${mediaSrc}" type="video/mp4" />`
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

    // Store current media index for navigation
    modal.data("current-index", mediaIndex);

    // Update navigation arrows state
    updateNavigationArrows(modal, commentId);

    modal.fadeIn(300);
    backdrop.fadeIn(300);
  });

  // Navigation arrow click handlers
  $(document).on("click", ".yay-reviews-nav-prev", function () {
    const modal = $(this).closest(".yay-reviews-preview-media-modal");
    const commentId = modal.data("comment-id");
    const currentIndex = parseInt(modal.data("current-index")) || 0;
    const totalMedia = modal.find(
      ".yay-reviews-modal-comment-medias-preview-item"
    ).length;

    if (totalMedia > 1) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : totalMedia - 1;
      navigateToMedia(modal, commentId, newIndex);
    }
  });

  $(document).on("click", ".yay-reviews-nav-next", function () {
    const modal = $(this).closest(".yay-reviews-preview-media-modal");
    const commentId = modal.data("comment-id");
    const currentIndex = parseInt(modal.data("current-index")) || 0;
    const totalMedia = modal.find(
      ".yay-reviews-modal-comment-medias-preview-item"
    ).length;

    if (totalMedia > 1) {
      const newIndex = currentIndex < totalMedia - 1 ? currentIndex + 1 : 0;
      navigateToMedia(modal, commentId, newIndex);
    }
  });

  // Function to navigate to specific media
  function navigateToMedia(modal, commentId, mediaIndex) {
    const mediaItem = modal.find(
      `.yay-reviews-modal-comment-medias-preview-item[data-index="${mediaIndex}"]`
    );
    const mediaType = mediaItem.data("type");
    const mediaSrc = mediaItem.find("img").data("src");

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

    // Update active state
    modal
      .find(".yay-reviews-modal-comment-medias-preview-item")
      .removeClass("active");
    mediaItem.addClass("active");

    // Update current index
    modal.data("current-index", mediaIndex);

    // Update navigation arrows state
    updateNavigationArrows(modal, commentId);
  }

  // Function to update navigation arrows state
  function updateNavigationArrows(modal, commentId) {
    const currentIndex = parseInt(modal.data("current-index")) || 0;
    const totalMedia = modal.find(
      ".yay-reviews-modal-comment-medias-preview-item"
    ).length;

    const prevArrow = modal.find(".yay-reviews-nav-prev");
    const nextArrow = modal.find(".yay-reviews-nav-next");

    // Show/hide arrows based on media count
    if (totalMedia <= 1) {
      prevArrow.hide();
      nextArrow.hide();
    } else {
      prevArrow.show();
      nextArrow.show();
    }
  }

  // Close modal when clicking the close button
  $(".yay-reviews-modal-close").on("click", function () {
    closeModal();
  });

  // Close modal when clicking outside the content
  $(".yay-reviews-modal-backdrop").on("click", function (e) {
    closeModal();
  });

  $(".yay-reviews-see-all-media").on("click", function () {
    const currentModal = $(".yay-reviews-preview-media-modal");
    const currentBackdrop = $(".yay-reviews-modal-backdrop");
    const allMediaDialog = $(".yay-reviews-all-media-dialog");
    const allMediaDialogBackdrop = $(".yay-reviews-all-media-dialog-backdrop");
    currentModal.fadeOut(300);
    currentBackdrop.fadeOut(300);
    allMediaDialog.fadeIn(300);
    allMediaDialogBackdrop.fadeIn(300);
  });

  // Close modal with escape key
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }

    // Arrow key navigation
    if ($(".yay-reviews-preview-media-modal").is(":visible")) {
      const modal = $(".yay-reviews-preview-media-modal:visible");
      const commentId = modal.data("comment-id");
      const currentIndex = parseInt(modal.data("current-index")) || 0;
      const totalMedia = modal.find(
        ".yay-reviews-modal-comment-medias-preview-item"
      ).length;

      if (totalMedia > 1) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          const newIndex = currentIndex > 0 ? currentIndex - 1 : totalMedia - 1;
          navigateToMedia(modal, commentId, newIndex);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          const newIndex = currentIndex < totalMedia - 1 ? currentIndex + 1 : 0;
          navigateToMedia(modal, commentId, newIndex);
        }
      }
    }
  });

  function closeModal() {
    $(
      ".yay-reviews-preview-media-modal, .yay-reviews-modal-backdrop, .yay-reviews-all-media-dialog, .yay-reviews-all-media-dialog-backdrop"
    ).fadeOut(300);
    $(".yay-reviews-modal-comment-medias-preview-item").removeClass("active");

    // Reset navigation state
    $(".yay-reviews-preview-media-modal").removeData("current-index");
    $(".yay-reviews-nav-arrow").hide();
  }

  $(".yay-reviews-modal-comment-medias-preview-item").on("click", function () {
    if ($(this).hasClass("active")) {
      return;
    }

    const mediaIndex = $(this).data("index");
    const commentId = $(this)
      .closest(".yay-reviews-preview-media-modal")
      .data("comment-id");
    const modal = $(
      `.yay-reviews-preview-media-modal[data-comment-id="${commentId}"]`
    );

    navigateToMedia(modal, commentId, mediaIndex);
  });

  tippy("[data-tippy-content]");
});
