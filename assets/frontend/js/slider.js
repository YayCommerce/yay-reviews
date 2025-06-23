setTimeout(function () {
  // Elements
  var bannerEl = document.querySelector(".banner");
  if (!bannerEl) {
    return;
  }
  var sliderEl = document.querySelectorAll(".slider");
  var linksEl = document.querySelector(".links");
  var imgLinks = linksEl.querySelectorAll(".link-item");

  // Data attributes
  var height = bannerEl.getAttribute("data-height");
  var width = bannerEl.getAttribute("data-width");
  var slideSpeed = bannerEl.getAttribute("data-slide-speed");

  // Helper function to find image by data-index
  function findImageByDataIndex(dataIndex) {
    return bannerEl.querySelector("img[data-index='" + dataIndex + "']");
  }

  // Slider variables
  var totalImgs = imgLinks.length;
  var currentImgNumber = 1;
  var nextImgNumber = currentImgNumber + 1;
  var previousImgNumber = totalImgs;
  var randomImgNumber = 3;
  var currentImg = findImageByDataIndex(currentImgNumber);
  var nextImg = findImageByDataIndex(nextImgNumber);
  var randomImg = findImageByDataIndex(randomImgNumber);

  // Set CSS to element or elements
  function setCSS(styles, elements) {
    if (elements.length > 1) {
      for (var i = 0; i < elements.length; i++) {
        Object.assign(elements[i].style, styles);
      }
    } else {
      Object.assign(elements.style, styles);
    }
  }

  // Set CSS before elements appear
  document.body.style.margin = "0";

  setCSS(
    {
      width: width,
      height: height + "px",
      margin: "0 auto",
      position: "relative",
    },
    bannerEl
  );

  setCSS(
    {
      "text-align": "center",
      position: "relative",
      top: "450px",
      left: "0",
      right: "0",
      margin: "auto",
      cursor: "default",
      width: imgLinks.length * 30 + "px",
    },
    linksEl
  );

  // For multiple elements of same class
  // Iterate over and set individual element's CSS
  for (var i = 0; i < sliderEl.length; i++) {
    setCSS(
      {
        width: width,
        height: height + "px",
        margin: "0 auto",
      },
      sliderEl[i]
    );

    setCSS(
      {
        position: "absolute",
        opacity: "0",
        "object-fit": "contain",
        cursor: "pointer",
      },
      sliderEl[i]
    );
  }

  for (var i = 0; i < imgLinks.length; i++) {
    setCSS(
      {
        color: "#000",
        display: "inline-block",
        "text-decoration": "none",
        background: "#717171",
        "border-radius": "50%",
        height: "15px",
        width: "15px",
        margin: "10px 5px",
        transition: "all 0.5s",
        cursor: "pointer",
      },
      imgLinks[i]
    );
  }

  (function () {
    function fadeTo(element, speed, opacity) {
      setCSS(
        {
          transition: "opacity " + speed + "ms",
          opacity: opacity,
        },
        element
      );
    }

    function loadImg() {
      fadeTo(currentImg, slideSpeed, 1);
    }

    function randomImgFade() {
      fadeTo(currentImg, slideSpeed, 0);
      fadeTo(randomImg, slideSpeed, 1);
    }

    function boldText() {
      const banner = document.querySelector(".yay-reviews-slider .banner");
      banner.setAttribute("data-current-img-number", currentImgNumber);
      for (var i = 0; i < imgLinks.length; i++) {
        var currentDataIndex = imgLinks[i].getAttribute("data-index");
        var opacity = currentImgNumber == currentDataIndex ? 0.8 : 0.4;

        if (currentImgNumber == currentDataIndex) {
          imgLinks[i].classList.add("active");
        } else {
          imgLinks[i].classList.remove("active");
        }
        setCSS({ opacity: opacity }, imgLinks[i]);
      }
    }

    function imgLoop() {
      nextImgNumber = currentImgNumber + 1;
      previousImgNumber = currentImgNumber - 1;

      if (currentImgNumber == totalImgs) {
        nextImgNumber = 1;
      }

      if (currentImgNumber == 1) {
        previousImgNumber = totalImgs;
      }
    }

    function refreshImgs() {
      currentImg = findImageByDataIndex(currentImgNumber);
      nextImg = findImageByDataIndex(nextImgNumber);
      previousImg = findImageByDataIndex(previousImgNumber);
      randomImg = findImageByDataIndex(randomImgNumber);
    }

    function callFunctions() {
      boldText();
      imgLoop();
      refreshImgs();
    }

    // Iterate over all links
    // On link click, restart interval, and fade in that image
    for (var i = 0; i < imgLinks.length; i++) {
      imgLinks[i].onclick = function () {
        randomImgNumber = parseInt(this.getAttribute("data-index"));
        randomImg = findImageByDataIndex(randomImgNumber);
        randomImgFade();
        currentImgNumber = randomImgNumber;
        callFunctions();
        return false;
      };
    }

    boldText();
    loadImg();
  })();
}, 1000);
