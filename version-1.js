const canvasSketch = require("canvas-sketch");
const _ = require("lodash");
const random = require("canvas-sketch-util/random");
const StackBlur = require("stackblur-canvas");
// const Color = require('canvas-sketch-util/color');
import { color } from "d3-color";
const { GUI } = require("dat.gui");
// const logoSquare = require("./images/newline-logo-square.svg");

var modes = [
  "normal",
  "destination-over",
  "lighter",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity"
];

var quality = ["superfast", "fast", "good"];

const data = {
  backgroundColor:
    getLocalStorage("backgroundColor") || "#ffe3cf",
  color1: getLocalStorage("color1") || "#f7a972",
  color2: getLocalStorage("color2") || "#b190fc",
  color3: getLocalStorage("color3") || "#ffa0e0",
  color4: getLocalStorage("color4") || "#93dfff",
  color5: getLocalStorage("color5") || "#ffffff",
  color6: getLocalStorage("color6") || "#454545",
  guestColor1: getLocalStorage("guestColor1") || "#f7a972",
  guestColor2: getLocalStorage("guestColor2") || "#f7a972",
  textColor: getLocalStorage("textColor") || "#fff",
  circleColor: getLocalStorage("circleColor") || "#fff",
  guest: getLocalStorage("guest") || "",
  filter: getLocalStorage("filter") || "",
  mode: getLocalStorage("mode") || modes[0],
  quality: getLocalStorage("quality") || quality[0],
  guestFontSize: getLocalStorage("guestFontSize") || 0.56,
  imageName: getLocalStorage("imageName") || "",
  numColors: +getLocalStorage("numColors") || 4,
  darkness: +getLocalStorage("darkness") || 50,
  guestContrast: +getLocalStorage("guestContrast") || 0,
  seed: +getLocalStorage("seed") || 0
};
const settings = {
  dimensions: [2048, 2048],
  data
};

const colors = [
  "#DE86B0",
  "#466DCA",
  "#E6A7D2",
  "#E08FA0",
  "#9EAAE6"
  // "#8A5080",
  // "#99331D",
];

const sketch = () => {
  return async ({ context, width, height, data }) => {
    context.fillStyle = data.backgroundColor;
    context.fillRect(0, 0, width, height);
    context.globalAlpha = 1;

    random.setSeed(data.seed);
    let colors = random.shuffle(
      _.range(1, data.numColors + 1).map(
        i => data[`color${i}`]
      )
    );

    const maxWH = Math.max(width, height);

    const positions = _.range(0, data.numColors).map(i => [
      random.range(0, width),
      random.range(0, height),
      random.range(maxWH / 5, maxWH / 2)
    ]);

    _.forEach(positions, ([x, y, r], i) => {
      // const color = random.pick(colors);
      const color = colors[i];
      // let gradient = context.createRadialGradient(
      //   x,
      //   y,
      //   0,
      //   x,
      //   y,
      //   r
      // );
      // context.globalCompositeOperation = random.pick([
      //   ..._.range(0, data.darkness).map(() => "multiply"),
      //   ..._.range(0, 100 - data.darkness).map(
      //     () => "screen"
      //   ),
      //   ..._.range(0, 100 - data.darkness).map(
      //     () => "overlay"
      //   )
      // ]);

      // gradient.addColorStop(0, color);
      // gradient.addColorStop(1, `${color}00`);

      // context.fillStyle = gradient;
      context.fillStyle = color;

      context.beginPath();
      context.ellipse(
        x,
        y,
        r,
        r,
        Math.PI / 4,
        0,
        2 * Math.PI
      );
      context.fill();
      context.fill();
      context.fill();
    });

    // const savedImage = context.getImageData(
    //   0,
    //   0,
    //   width,
    //   height
    // );

    // context.translate(width, 0);
    // context.scale(-1, 1);
    // const flippedImage = context.getImageData(
    //   0,
    //   0,
    //   width,
    //   height
    // );

    if (data.quality !== "superfast") {
      boxBlurCanvasRGB(
        context,
        0,
        0,
        width,
        height,
        150,
        data.quality === "good" ? 8 : 0
      );
    }

    context.globalCompositeOperation = "normal";

    // the circle
    // context.fillStyle = data.circleColor;
    // context.beginPath();
    // context.ellipse(
    //   width / 2,
    //   height * 0.45,
    //   width * 0.4,
    //   width * 0.4,
    //   Math.PI / 4,
    //   0,
    //   2 * Math.PI
    // );
    // context.fill();

    // the lines
    const bufferCanvas = document.createElement("canvas");
    // bufferCanvas.width = width;
    // bufferCanvas.height = height;
    // var context2 = bufferCanvas.getContext("2d");

    // context2.putImageData(
    //   flippedImage,
    //   width * 0.03,
    //   height * 0.12,
    //   width * 0.03,
    //   height * 0.12,
    //   width * 0.85,
    //   height * 0.06
    // );
    // context2.putImageData(
    //   flippedImage,
    //   width * 0.03,
    //   height * 0.18,
    //   width * 0.03,
    //   height * 0.18,
    //   width * 0.85,
    //   height * 0.06
    // );
    // context2.putImageData(
    //   flippedImage,
    //   width * 0.03,
    //   height * 0.24,
    //   width * 0.03,
    //   height * 0.24,
    //   width * 0.85,
    //   height * 0.06
    // );

    const rotation = 0.1;
    const xTranslation = 90;

    context.rotate(rotation);
    context.translate(xTranslation, 0);
    context.drawImage(bufferCanvas, 0, 0);
    context.translate(-xTranslation, 0);
    context.rotate(-rotation);

    if (data.imageName) {
      try {
        const image = new Image();
        const imgPromise = onload2promise(image);
        image.src = `/images/${data.imageName}`;
        await imgPromise;
        // context.globalAlpha = 0.9
        // context.drawImage(image,
        //   0, 0,
        //   // 500, 500,
        //   image.naturalWidth, image.naturalWidth,
        //   width * 0.05, height * 0.1,
        //   width * 0.9, height * 0.9,
        // )
        // grayScale(context, image, width, height)
        // console.log(image)
        context.globalAlpha = 1;
        // context.putImageData(savedImage, 0, 0)
        const duotoneImage = Filters.duotone(
          context,
          image,
          width,
          height,
          data.guestColor1,
          data.guestColor2,
          data.filter
        );
        // context.putImageData(duotoneImage, 0, 0)
        context.globalCompositeOperation =
          data.mode || "overlay";
        // context.globalCompositeOperation = "destination-in"
        context.drawImage(
          duotoneImage,
          0,
          0
          // 500, 500,
          // image.naturalWidth, image.naturalWidth,
          // width * 0.05, height * 0.1,
          // width * 0.9, height * 0.9,
        );
        // context.globalCompositeOperation = "normal"
      } catch (e) {
        console.log(e);
      }
    }

    context.globalCompositeOperation = "normal";
    context.fillStyle = data.textColor || "#1b1a25";
    // context.font = "900 390px Inter";
    // context.fillText("/newline", 120, (height / 2) + 8);
    // context.font = "200 262px Inter";
    // context.fillText("PODCAST".split("").join(String.fromCharCode(8202)), 275, (height / 2) + 300);

    const logo = new Path2D(`
M11.6733 20.3632L0.129228 25.2043L42.3954 107.688L54.5911 104.058L11.6733 20.3632ZM74.921 52.8542C78.738 52.8542 81.2516 54.9954 81.2516 62.5363V90H94.4715V57.7883C94.4715 46.3374 89.4442 41.5894 81.4378 41.5894C75.1072 41.5894 70.5455 44.4754 67.0078 47.8269L66.3561 42.6135L54.0672 43.2652C54.7189 53.7852 54.9051 68.2152 54.9051 90H68.1249C68.1249 76.0354 67.9387 64.0259 67.7525 55.0885C69.8938 53.6921 72.2212 52.8542 74.921 52.8542ZM139.286 91.1172L140.496 80.2248C121.691 79.9455 114.708 77.8043 113.219 69.9841L141.613 69.2393C143.289 52.0163 137.052 41.5894 123.552 41.5894C110.984 41.5894 99.9058 52.7611 99.9058 67.4705C99.9058 82.8315 107.819 91.955 139.286 91.1172ZM121.132 52.2956C126.439 52.2956 128.58 55.7402 128.859 61.8846C124.018 61.9777 117.222 62.257 112.939 62.3501C113.405 54.9023 116.105 52.2956 121.132 52.2956ZM173.394 90H185.031C186.428 80.7834 188.755 60.9536 189.5 42.8928H177.211C177.211 54.4368 177.118 62.4432 177.025 75.1044H176.653C175.163 69.7979 172.836 62.6294 171.439 58.1607H164.084C162.781 62.5363 160.547 69.5186 159.057 74.8251H158.685C158.499 62.1639 158.312 54.3437 158.219 42.8928H145.558C146.21 60.9536 148.351 80.7834 149.841 90H161.198L167.064 69.6117L173.394 90ZM233.942 90L235.059 80.1317H221.188V24.7388H195.4L194.283 34.2347L207.875 34.9795V80.1317H194.096V90H233.942ZM269.447 36.376L270.285 22.8769H256.413L255.575 36.376H269.447ZM283.598 90L284.715 80.1317H269.54V42.8928H241.704L240.68 52.2956L256.227 53.0404V80.1317H241.052V90H283.598ZM307.838 52.8542C311.655 52.8542 314.168 54.9954 314.168 62.5363V90H327.388V57.7883C327.388 46.3374 322.361 41.5894 314.354 41.5894C308.024 41.5894 303.462 44.4754 299.924 47.8269L299.273 42.6135L286.984 43.2652C287.636 53.7852 287.822 68.2152 287.822 90H301.042C301.042 76.0354 300.855 64.0259 300.669 55.0885C302.81 53.6921 305.138 52.8542 307.838 52.8542ZM372.203 91.1172L373.413 80.2248C354.607 79.9455 347.625 77.8043 346.135 69.9841L374.53 69.2393C376.206 52.0163 369.968 41.5894 356.469 41.5894C343.901 41.5894 332.822 52.7611 332.822 67.4705C332.822 82.8315 340.736 91.955 372.203 91.1172ZM354.049 52.2956C359.355 52.2956 361.496 55.7402 361.776 61.8846C356.935 61.9777 350.138 62.257 345.856 62.3501C346.321 54.9023 349.021 52.2956 354.049 52.2956Z M60.8603 148.947H65.9076V137.186H72.7679C80.5267 137.186 84.3652 132.499 84.3652 126.324C84.3652 120.166 80.5594 115.495 72.7843 115.495H60.8603V148.947ZM65.9076 132.907V119.823H72.2452C77.2435 119.823 79.2853 122.535 79.2853 126.324C79.2853 130.114 77.2435 132.907 72.3106 132.907H65.9076ZM133.946 132.221C133.946 121.522 127.543 115.037 118.886 115.037C110.196 115.037 103.809 121.522 103.809 132.221C103.809 142.903 110.196 149.405 118.886 149.405C127.543 149.405 133.946 142.92 133.946 132.221ZM128.948 132.221C128.948 140.372 124.636 144.798 118.886 144.798C113.12 144.798 108.824 140.372 108.824 132.221C108.824 124.07 113.12 119.644 118.886 119.644C124.636 119.644 128.948 124.07 128.948 132.221ZM165.673 148.947C175.866 148.947 181.763 142.626 181.763 132.172C181.763 121.767 175.866 115.495 166.016 115.495H154.844V148.947H165.673ZM159.891 144.537V119.905H165.706C173.024 119.905 176.797 124.282 176.797 132.172C176.797 140.094 173.024 144.537 165.396 144.537H159.891ZM230.429 126.373C229.285 119.219 223.683 115.037 216.61 115.037C207.953 115.037 201.566 121.522 201.566 132.221C201.566 142.92 207.92 149.405 216.61 149.405C223.96 149.405 229.334 144.798 230.429 138.183L225.332 138.167C224.467 142.446 220.873 144.798 216.643 144.798C210.909 144.798 206.581 140.404 206.581 132.221C206.581 124.103 210.893 119.644 216.659 119.644C220.922 119.644 224.499 122.045 225.332 126.373H230.429ZM253.899 148.947L256.97 140.094H270.037L273.092 148.947H278.45L266.411 115.495H260.58L248.542 148.947H253.899ZM258.44 135.847L263.373 121.571H263.634L268.567 135.847H258.44ZM315.861 124.282H320.729C320.582 118.925 315.845 115.037 309.05 115.037C302.337 115.037 297.191 118.876 297.191 124.642C297.191 129.297 300.524 132.025 305.897 133.479L309.85 134.557C313.428 135.504 316.188 136.68 316.188 139.653C316.188 142.92 313.068 145.076 308.772 145.076C304.885 145.076 301.651 143.345 301.357 139.702H296.293C296.62 145.762 301.308 149.503 308.805 149.503C316.662 149.503 321.186 145.37 321.186 139.702C321.186 133.675 315.812 131.339 311.565 130.293L308.299 129.444C305.685 128.774 302.206 127.549 302.222 124.348C302.222 121.506 304.819 119.399 308.936 119.399C312.774 119.399 315.502 121.195 315.861 124.282ZM340.173 119.84H350.594V148.947H355.625V119.84H366.063V115.495H340.173V119.84Z `);

    if (data.guest) {
      context.save();
      const logoScale = 3;
      const logoWidth = 400 * logoScale; // todo calc
      const logoHeight = 200 * logoScale; // todo calc
      const logoTop = -550;

      context.translate(
        width / 2 - logoWidth / 2,
        height / 2 - logoHeight / 2 - logoTop
      );

      context.scale(logoScale, logoScale);

      context.fill(logo);
      context.globalAlpha = 1;
      context.restore();

      context.globalCompositeOperation = "normal";
      const guestString = `with ${data.guest}`;
      const fontSize =
        width /
        (guestString.length * (3 - data.guestFontSize * 3));
      context.font = `600 ${fontSize}px Inter UI`;
      context.textAlign = "right";
      context.fillText(
        guestString,
        width - 120,
        height - 160
      );

      // context.globalAlpha = 0.3;
      // context.globalCompositeOperation = "darken";
      // context.fillText(guestString, 120, height - 160);

      // context.globalCompositeOperation = "difference";
      // context.globalAlpha = 1;
      // context.fillText(guestString, 120, height - 155);
    } else {
      context.fill(logo);
    }

    {
      // add newline logo
      const image = new Image();
      const imgPromise = onload2promise(image);
      image.src = `/images/newline-logo-square.svg`;
      await imgPromise;
      console.log(
        "image.naturalWidth: ",
        image.naturalWidth
      );

      context.drawImage(
        image,
        0,
        0,
        // 500, 500,
        // image.naturalWidth,
        // image.naturalWidth,
        800,
        800,
        width * 0.05,
        width * 0.05,
        width * 1.05,
        width * 1.05
      );
    }
  };
};

(async () => {
  const manager = await canvasSketch(sketch, settings);

  // Can disable this entirely
  const useGUI = true;
  if (useGUI) {
    const gui = new GUI();
    // gui.useLocalStorage = true
    // readLocalStorage();

    // Setup parameters
    addColor(gui, data, "backgroundColor").name("bg color");
    addColor(gui, data, "color1").name("color 1");
    addColor(gui, data, "color2").name("color 2");
    addColor(gui, data, "color3").name("color 3");
    addColor(gui, data, "color4").name("color 4");
    addColor(gui, data, "color5").name("color 5");
    addColor(gui, data, "color6").name("color 6");
    addColor(gui, data, "guestColor1").name("gcolor 1");
    addColor(gui, data, "guestColor2").name("gcolor 2");
    addColor(gui, data, "textColor").name("text color");
    addColor(gui, data, "circleColor").name("circle color");
    add(gui, data, "filter");
    add(gui, data, "guest");
    add(gui, data, "guestFontSize", 0, 1, 0.01);
    add(gui, data, "imageName");
    add(gui, data, "mode", modes);
    add(gui, data, "quality", quality);
    add(gui, data, "numColors", 0, 6, 1);
    add(gui, data, "darkness", 0, 100, 1);
    add(gui, data, "guestContrast", 0, 100, 1);
    add(gui, data, "seed", _.range(0, 1000));
    // add(gui, data, "number", 0, 1, 0.01);
  }

  // Helper functions
  function addColor(gui, ...args) {
    return gui
      .addColor(...args)
      .onChange(newValue => render(args[1], newValue));
  }

  function add(gui, ...args) {
    return gui
      .add(...args)
      .onChange(newValue => render(args[1], newValue));
  }

  function render(...args) {
    manager.render();
    putLocalStorage(...args);
  }
})();

function putLocalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorage(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

function grayScale(context, width, height) {
  var imgData = context.getImageData(0, 0, width, height);
  var pixels = imgData.data;
  for (var i = 0, n = pixels.length; i < n; i += 4) {
    var grayscale =
      pixels[i] * 0.3 +
      pixels[i + 1] * 0.59 +
      pixels[i + 2] * 0.11;
    pixels[i] = grayscale; // red
    pixels[i + 1] = grayscale; // green
    pixels[i + 2] = grayscale; // blue
    //pixels[i+3]              is alpha
  }
  //redraw the image in black & white
  context.putImageData(imgData, 0, 0);
}

function onload2promise(obj) {
  return new Promise((resolve, reject) => {
    obj.onload = () => resolve(obj);
    obj.onerror = reject;
  });
}

let Filters = {};
Filters.getPixels = function(
  ctx,
  image,
  width,
  height,
  filter
) {
  // var c = this.getCanvas(img.width, img.height);
  // var ctx = c.getContext('2d');
  const bufferCanvas = document.createElement("canvas");
  bufferCanvas.width = width;
  bufferCanvas.height = height;
  var context2 = bufferCanvas.getContext("2d");
  context2.filter = filter;
  context2.drawImage(
    image,
    0,
    0,
    // 500, 500,
    image.naturalWidth,
    image.naturalWidth,
    -width * 0.06,
    width * 0.05,
    width * 1.05,
    width * 1.05
  );
  return [
    bufferCanvas,
    context2,
    context2.getImageData(0, 0, width, height)
  ];
};

Filters.grayscale = function(pixels) {
  var d = pixels.data;
  var max = 0;
  var min = 255;
  for (var i = 0; i < d.length; i += 4) {
    // Fetch maximum and minimum pixel values
    if (d[i] > max) {
      max = d[i];
    }
    if (d[i] < min) {
      min = d[i];
    }
    // Grayscale by averaging RGB values
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];
    var v = 0.3333 * r + 0.3333 * g + 0.3333 * b;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  for (var i = 0; i < d.length; i += 4) {
    // Normalize each pixel to scale 0-255
    var v = ((d[i] - min) * 255) / (max - min);
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  return pixels;
};

const hexToRgb = hex => color(hex).rgb();

Filters.gradientMap = function(tone1, tone2) {
  var rgb1 = hexToRgb(tone1);
  var rgb2 = hexToRgb(tone2);
  var gradient = [];
  for (var i = 0; i < 256 * 4; i += 4) {
    gradient[i] =
      ((256 - i / 4) * rgb1.r + (i / 4) * rgb2.r) / 256;
    gradient[i + 1] =
      ((256 - i / 4) * rgb1.g + (i / 4) * rgb2.g) / 256;
    gradient[i + 2] =
      ((256 - i / 4) * rgb1.b + (i / 4) * rgb2.b) / 256;
    gradient[i + 3] = 255;
  }
  return gradient;
};

Filters.duotone = function(
  ctx,
  img,
  width,
  height,
  tone1,
  tone2,
  filter
) {
  var [bufferCanvas, context2, pixels] = this.getPixels(
    ctx,
    img,
    width,
    height,
    filter
  );
  pixels = Filters.grayscale(pixels);
  var gradient = this.gradientMap(tone1, tone2);
  pixels = contrastImage(pixels, data.guestContrast);
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    if (d[i + 3]) {
      d[i] = gradient[d[i] * 4];
      d[i + 1] = gradient[d[i + 1] * 4 + 1];
      d[i + 2] = gradient[d[i + 2] * 4 + 2];
    } else {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 0;
    }
  }

  context2.putImageData(pixels, 0, 0);

  return bufferCanvas;
};

function contrastImage(imgData, contrast) {
  //input range [-100..100]
  var d = imgData.data;
  contrast = contrast / 100 + 1; //convert to decimal & shift range: [0..2]
  var intercept = 128 * (1 - contrast);
  for (var i = 0; i < d.length; i += 4) {
    //r,g,b,a
    d[i] = d[i] * contrast + intercept;
    d[i + 1] = d[i + 1] * contrast + intercept;
    d[i + 2] = d[i + 2] * contrast + intercept;
  }
  return imgData;
}

/*

Superfast Blur - a fast Box Blur For Canvas
Author:		Mario Klingemann
*/

// prettier-ignore
var mul_table = [ 1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1];

// prettier-ignore
var shg_table = [0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];

function boxBlurCanvasRGB(
  context,
  top_x,
  top_y,
  width,
  height,
  radius,
  iterations
) {
  if (isNaN(radius) || radius < 1) return;

  radius |= 0;

  if (isNaN(iterations)) iterations = 1;
  iterations |= 0;
  if (iterations > 3) iterations = 3;
  if (iterations < 1) iterations = 1;

  var imageData;

  try {
    try {
      imageData = context.getImageData(
        top_x,
        top_y,
        width,
        height
      );
    } catch (e) {
      // NOTE: this part is supposedly only needed if you want to work with local files
      // so it might be okay to remove the whole try/catch block and just use
      // imageData = context.getImageData( top_x, top_y, width, height );
      try {
        imageData = context.getImageData(
          top_x,
          top_y,
          width,
          height
        );
      } catch (e) {
        throw new Error(
          "unable to access local image data: " + e
        );
        return;
      }
    }
  } catch (e) {
    throw new Error("unable to access image data: " + e);
    return;
  }

  var pixels = imageData.data;

  var rsum,
    gsum,
    bsum,
    asum,
    x,
    y,
    i,
    p,
    p1,
    p2,
    yp,
    yi,
    yw,
    idx;
  var wm = width - 1;
  var hm = height - 1;
  var wh = width * height;
  var rad1 = radius + 1;

  var r = [];
  var g = [];
  var b = [];

  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  var vmin = [];
  var vmax = [];

  while (iterations-- > 0) {
    yw = yi = 0;

    for (y = 0; y < height; y++) {
      rsum = pixels[yw] * rad1;
      gsum = pixels[yw + 1] * rad1;
      bsum = pixels[yw + 2] * rad1;

      for (i = 1; i <= radius; i++) {
        p = yw + ((i > wm ? wm : i) << 2);
        rsum += pixels[p++];
        gsum += pixels[p++];
        bsum += pixels[p++];
      }

      for (x = 0; x < width; x++) {
        r[yi] = rsum;
        g[yi] = gsum;
        b[yi] = bsum;

        if (y == 0) {
          vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
          vmax[x] = (p = x - radius) > 0 ? p << 2 : 0;
        }

        p1 = yw + vmin[x];
        p2 = yw + vmax[x];

        rsum += pixels[p1++] - pixels[p2++];
        gsum += pixels[p1++] - pixels[p2++];
        bsum += pixels[p1++] - pixels[p2++];

        yi++;
      }
      yw += width << 2;
    }

    for (x = 0; x < width; x++) {
      yp = x;
      rsum = r[yp] * rad1;
      gsum = g[yp] * rad1;
      bsum = b[yp] * rad1;

      for (i = 1; i <= radius; i++) {
        yp += i > hm ? 0 : width;
        rsum += r[yp];
        gsum += g[yp];
        bsum += b[yp];
      }

      yi = x << 2;
      for (y = 0; y < height; y++) {
        pixels[yi] = (rsum * mul_sum) >>> shg_sum;
        pixels[yi + 1] = (gsum * mul_sum) >>> shg_sum;
        pixels[yi + 2] = (bsum * mul_sum) >>> shg_sum;

        if (x == 0) {
          vmin[y] = ((p = y + rad1) < hm ? p : hm) * width;
          vmax[y] = (p = y - radius) > 0 ? p * width : 0;
        }

        p1 = x + vmin[y];
        p2 = x + vmax[y];

        rsum += r[p1] - r[p2];
        gsum += g[p1] - g[p2];
        bsum += b[p1] - b[p2];

        yi += width << 2;
      }
    }
  }
  context.putImageData(imageData, top_x, top_y);
}
