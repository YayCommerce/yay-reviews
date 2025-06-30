jQuery(document).ready(function ($) {
  const reviewTitleInput = $(".yay-reviews-review-title");
  const commentInput = $(".comment-form-comment");
  // swap review title and comment input
  if (reviewTitleInput.length && commentInput.length) {
    reviewTitleInput.after(commentInput);
  }
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
  const grid = document.querySelector(".yay-reviews-upload-media__upload-list");
  let yayReviewsFilesArr = [];
  let renderedFilesCount = 0;

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function createVideoThumbnail(file) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = function () {
        video.currentTime = 1;
      };
      video.onseeked = function () {
        const canvas = document.createElement("canvas");
        canvas.width = 96;
        canvas.height = 96;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL();
        const duration = formatDuration(video.duration);
        URL.revokeObjectURL(video.src);
        resolve({ thumbnailUrl, duration });
      };
      video.src = URL.createObjectURL(file);
    });
  }

  async function createThumbnail(file) {
    if (file.type.startsWith("video/")) {
      return await createVideoThumbnail(file);
    } else {
      return { thumbnailUrl: URL.createObjectURL(file) };
    }
  }

  async function renderThumbnails() {
    for (let i = renderedFilesCount; i < yayReviewsFilesArr.length; i++) {
      const file = yayReviewsFilesArr[i];
      const { thumbnailUrl, duration } = await createThumbnail(file);

      let overlay = "";
      if (file.type.startsWith("video/")) {
        overlay = `
          <div class="yay-reviews-media-card__video-details">
            <span>
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
            <span>${duration || "0:00"}</span>
          </div>
        `;
      }

      const card = document.createElement("div");
      card.className =
        "yay-reviews-upload-media__upload-item yay-reviews-media-card";
      card.innerHTML = `
        <div class="yay-reviews-media-card-wrapper">
          <div class="yay-reviews-media-card-inner">
            <img src="${thumbnailUrl}" alt="preview" data-file-type="${file.type}">
            ${overlay}
          </div>
        </div>
        <button type="button" class="yay-reviews-upload-media__upload-item-remove"  data-index="${i}">&times;</button>
      `;
      grid.insertBefore(card, grid.lastElementChild);
    }
    renderedFilesCount = yayReviewsFilesArr.length;

    // Hide upload card if max files reached
    const uploadCard = grid.querySelector(".yay-reviews-upload-button");
    if (uploadCard) {
      uploadCard.style.display =
        yayReviewsFilesArr.length >= parseInt(yay_reviews.max_upload_qty)
          ? "none"
          : "flex";
    }
  }

  // Handle delete button clicks
  $(document).on(
    "click",
    ".yay-reviews-upload-media__upload-item-remove",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      const idx = parseInt($(this).data("index"));
      removeFile(idx);
    }
  );

  function removeFile(idx) {
    // Remove the thumbnail element
    const thumbCards = grid.querySelectorAll(
      ".yay-reviews-upload-media__upload-item"
    );
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
    const uploadCard = grid.querySelector(".yay-reviews-upload-button");
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

    // Review title validation max length 60
    var reviewTitle = $("#yay-reviews-title").val();
    if (reviewTitle && reviewTitle.length > 60) {
      e.preventDefault();
      alert(yay_reviews.review_title_max_length_notice);
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

  $("#yay-reviews-file-input").on("change", async function (event) {
    const dropzone = document.querySelector(".yay-reviews-upload-button");
    const accept = dropzone.dataset.accept;

    var max_upload_qty = parseInt(yay_reviews.max_upload_qty);
    var max_upload_size = parseInt(yay_reviews.max_upload_size);

    var files = Array.from(event.target.files);

    // Show loading state
    const uploadCard = document.querySelector(".yay-reviews-upload-button");
    const originalContent = uploadCard.innerHTML;
    uploadCard.innerHTML = `
      <div class="yay-reviews-loading-icon"></div>
      <span class="text-xs text-gray-500 mt-1">${
        yay_reviews.uploading_text || "Uploading..."
      }</span>
    `;
    uploadCard.style.pointerEvents = "none";

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
      for (const file of files) {
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
            continue;
          }
          yayReviewsFilesArr.push(file);
        }
      }

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

      await renderThumbnails();
    }

    // Restore upload card to original state
    uploadCard.innerHTML = originalContent;
    uploadCard.style.pointerEvents = "auto";
  });

  // Create modal HTML if it doesn't exist
  function ensureModalExists() {
    if (!document.getElementById("yay-reviews-modal")) {
      const modalHTML = `
        <div id="yay-reviews-modal">
          <div class="yay-reviews-modal-wrapper">
            <span id="yay-reviews-modal-close">&times;</span>
            <div id="yay-reviews-modal-content">
              <!-- Content will be inserted here -->
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHTML);

      // Add modal close handler
      document
        .getElementById("yay-reviews-modal-close")
        .addEventListener("click", () => {
          document.getElementById("yay-reviews-modal").classList.add("hidden");
        });

      // Close modal when clicking outside
      document
        .getElementById("yay-reviews-modal")
        .addEventListener("click", (e) => {
          if (e.target.id === "yay-reviews-modal") {
            e.target.classList.add("hidden");
          }
        });
    }
  }

  // Show media in modal
  function showMediaInModal(file, thumbnailUrl) {
    ensureModalExists();
    const modal = document.getElementById("yay-reviews-modal");
    const modalContent = document.getElementById("yay-reviews-modal-content");

    if (file.type.startsWith("video/")) {
      modalContent.innerHTML = `
        <video controls>
          <source src="${URL.createObjectURL(file)}" type="${file.type}">
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      modalContent.innerHTML = `
        <img src="${thumbnailUrl}" alt="preview">
      `;
    }

    modal.classList.remove("hidden");
  }

  // Add click handler for thumbnails
  $(document).on(
    "click",
    ".yay-reviews-upload-media__upload-item",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      const index = $(this).find("button").data("index");
      const file = yayReviewsFilesArr[index];
      const thumbnailUrl = $(this).find("img").attr("src");
      showMediaInModal(file, thumbnailUrl);
    }
  );

  // Add verified owner badge
  const verifiedOwnerBadge = $(".woocommerce-review__verified");
  const verifiedOwnerBadgeHtml = `<svg xmlns="http://www.w3.org/2000/svg " width="24" height="24" viewBox="0 0 24 24" fill="#067D62">
    <g clip-path="url(#clip0_4418_8618)">
    <path d="M21.5599 10.7405L20.1999 9.16055C19.9399 8.86055 19.7299 8.30055 19.7299 7.90055V6.20055C19.7299 5.14055 18.8599 4.27055 17.7999 4.27055H16.0999C15.7099 4.27055 15.1399 4.06055 14.8399 3.80055L13.2599 2.44055C12.5699 1.85055 11.4399 1.85055 10.7399 2.44055L9.16988 3.81055C8.86988 4.06055 8.29988 4.27055 7.90988 4.27055H6.17988C5.11988 4.27055 4.24988 5.14055 4.24988 6.20055V7.91055C4.24988 8.30055 4.03988 8.86055 3.78988 9.16055L2.43988 10.7505C1.85988 11.4405 1.85988 12.5605 2.43988 13.2505L3.78988 14.8405C4.03988 15.1405 4.24988 15.7005 4.24988 16.0905V17.8005C4.24988 18.8605 5.11988 19.7305 6.17988 19.7305H7.90988C8.29988 19.7305 8.86988 19.9405 9.16988 20.2005L10.7499 21.5605C11.4399 22.1505 12.5699 22.1505 13.2699 21.5605L14.8499 20.2005C15.1499 19.9405 15.7099 19.7305 16.1099 19.7305H17.8099C18.8699 19.7305 19.7399 18.8605 19.7399 17.8005V16.1005C19.7399 15.7105 19.9499 15.1405 20.2099 14.8405L21.5699 13.2605C22.1499 12.5705 22.1499 11.4305 21.5599 10.7405ZM16.1599 10.1105L11.3299 14.9405C11.1899 15.0805 10.9999 15.1605 10.7999 15.1605C10.5999 15.1605 10.4099 15.0805 10.2699 14.9405L7.84988 12.5205C7.55988 12.2305 7.55988 11.7505 7.84988 11.4605C8.13988 11.1705 8.61988 11.1705 8.90988 11.4605L10.7999 13.3505L15.0999 9.05055C15.3899 8.76055 15.8699 8.76055 16.1599 9.05055C16.4499 9.34055 16.4499 9.82055 16.1599 10.1105Z" fill="white" style="fill: var(--fillg);"/>
    </g>
    <defs>
      <clipPath id="clip0_4418_8618">
      <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>`;
  verifiedOwnerBadge.each(function () {
    const text = yay_reviews.verified_owner_text;
    const parent = $(this).parent();
    const author = parent.find(".woocommerce-review__author");
    $(this).remove();
    const newBadge = $(
      `<span class="yay-reviews-verified-badge" data-tippy-content="${text}">${verifiedOwnerBadgeHtml}</span>`
    );
    author.after(newBadge);

    // Add tooltip on hover for the new badge
    newBadge.hover(function () {
      $(this).attr("title", text);
    });
  });

  function updateArrowStates() {
    const track = $(".yay-reviews-all-media-track")[0];
    if (!track) return;

    const wrapper = $(".yay-reviews-all-media-wrapper");
    const leftArrow = wrapper.find(".left-arrow");
    const rightArrow = wrapper.find(".right-arrow");

    // A small tolerance to handle sub-pixel rendering issues
    const scrollEnd =
      Math.abs(track.scrollWidth - track.clientWidth - track.scrollLeft) < 1;
    const scrollStart = track.scrollLeft < 1;
    const isOverflowing = track.scrollWidth > track.clientWidth;

    if (!isOverflowing) {
      leftArrow.prop("disabled", true);
      rightArrow.prop("disabled", true);
    } else {
      leftArrow.prop("disabled", scrollStart);
      rightArrow.prop("disabled", scrollEnd);
    }
  }

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

  const slider = $(".yay-reviews-all-media");
  const allMediaDialog = $(".yay-reviews-all-media-dialog");
  const allMediaDialogBackdrop = $(".yay-reviews-all-media-dialog-backdrop");
  if (slider !== undefined) {
    const track = slider.find(".yay-reviews-all-media-track");
    // get all media reviews
    const mediaReviews = $(
      ".yay-reviews-review__media-list .yay-reviews-review__media-item img"
    );

    const mediaReviewsThumbnails = $(
      ".yay-reviews-modal-comment-medias-preview-item"
    );

    mediaReviewsThumbnails.each(function () {
      const commentId = $(this)
        .closest(".yay-reviews-review-details-modal")
        .data("comment-id");
      const imageIndex = $(this).data("index");
      const mediaType = $(this).data("type");
      const mediaSrc = $(this).find("img").data("src");
      const clone = $(this).clone();
      $(clone).click(function () {
        const modal = $(
          `.yay-reviews-review-details-modal[data-comment-id="${commentId}"]`
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
          `.yay-reviews-modal-comment-medias-preview-item[data-index = '${imageIndex}']`
        );
        commentMediasPreview.addClass("active");
        allMediaDialog.fadeOut(300);
        allMediaDialogBackdrop.fadeOut(300);
        modal.fadeIn(300);
        backdrop.fadeIn(300);
        navigateToMedia(modal, commentId, imageIndex);
      });
      allMediaDialog
        .find(".yay-reviews-all-media-dialog-content-wrapper")
        .append(clone);
    });

    if (mediaReviews.length === 0) {
      slider.remove();
      return;
    }

    mediaReviews.each(function () {
      const img = $(this);
      const imageWrap = img.closest(".yay-reviews-review__media-item");
      const imageClone = imageWrap.clone();
      imageClone.click(function () {
        const commentId = imageWrap.data("comment-id");
        const mediaType = imageWrap.data("type");
        const imageIndex = imageWrap.data("index");
        const mediaSrc = img.data("src");

        // get modal with comment id
        const modal = $(
          `.yay-reviews-review-details-modal[data-comment-id="${commentId}"]`
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
          `.yay-reviews-modal-comment-medias-preview-item[data-index = '${imageIndex}']`
        );
        commentMediasPreview.addClass("active");

        modal.fadeIn(300);
        backdrop.fadeIn(300);
        navigateToMedia(modal, commentId, imageIndex);
      });
      // Add to first position
      track.append(imageClone);
    });

    // Update on scroll
    track.on("scroll", updateArrowStates);
    // Update on resize
    $(window).on("resize", updateArrowStates);
  }

  $(document).on("click", ".yay-reviews-see-all-media", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const allMediaDialog = $(".yay-reviews-all-media-dialog");
    const allMediaDialogBackdrop = $(".yay-reviews-all-media-dialog-backdrop");
    $(".yay-reviews-modal-comment-medias-preview-item").removeClass("active");
    allMediaDialog.removeClass("hidden");
    allMediaDialogBackdrop.removeClass("hidden");
    allMediaDialog.fadeIn(300);
    allMediaDialogBackdrop.fadeIn(300);
    // show all media in modal
  });

  $(document).on(
    "click",
    ".yay-reviews-all-media-dialog-backdrop",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      const allMediaDialog = $(".yay-reviews-all-media-dialog");
      const allMediaDialogBackdrop = $(
        ".yay-reviews-all-media-dialog-backdrop"
      );
      allMediaDialog.fadeOut(300);
      allMediaDialogBackdrop.fadeOut(300);
    }
  );

  function updateScrollable() {
    const track = $(".yay-reviews-all-media-track")[0];

    if (!track || !track.children.length) return;

    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 0;
    const cardWidth = track.children[0].offsetWidth;

    const totalCards = $(track).find(".yay-reviews-media-card").length;
    const maxCardsPerView = Math.floor(track.clientWidth / (cardWidth + gap));

    if (totalCards > maxCardsPerView) {
      $(track).closest(".yay-reviews-all-media-wrapper").addClass("scrollable");
    } else {
      $(track).closest(".yay-reviews-all-media-wrapper").removeClass("scrollable");
    }
  }

  updateScrollable();

  $(window).on("resize", function () {
    updateScrollable();
  });

  $(document).on("click", ".yay-reviews-all-media-arrow", function () {
    const track = $(".yay-reviews-all-media-track")[0];
    if (!track || !track.children.length) return;

    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 0;
    const cardWidth = track.children[0].offsetWidth;
    const scrollAmount = cardWidth + gap;

    if ($(this).hasClass("left-arrow")) {
      track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  });
});
