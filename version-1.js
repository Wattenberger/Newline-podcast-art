const canvasSketch = require('canvas-sketch');
const _ = require('lodash');
const random = require('canvas-sketch-util/random');
// const Color = require('canvas-sketch-util/color');
import { color } from "d3-color"
const { GUI } = require("dat.gui")

var modes = ['normal', 'destination-over', 'lighter', 'multiply', 'screen', 'overlay', 'darken',
             'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light',
             'exclusion', 'hue', 'saturation', 'color', 'luminosity' ];
const data = {
  color1: getLocalStorage("color1") || "#f7a972",
  color2: getLocalStorage("color2") || "#b190fc",
  color3: getLocalStorage("color3") || "#ffa0e0",
  color4: getLocalStorage("color4") || "#93dfff",
  color5: getLocalStorage("color5") || "#ffffff",
  color6: getLocalStorage("color6") || "#454545",
  textColor: getLocalStorage("textColor") || "#fff",
  circleColor: getLocalStorage("circleColor") || "#fff",
  guest: getLocalStorage("guest") || "",
  filter: getLocalStorage("filter") || "",
  mode: getLocalStorage("mode") || modes[0],
  guestFontSize: getLocalStorage("guestFontSize") || 0.56,
  imageName: getLocalStorage("imageName") || "",
  numColors: +getLocalStorage("numColors") || 4,
  darkness: +getLocalStorage("darkness") || 50,
  seed: +getLocalStorage("seed") || 0,
};
const settings = {
  dimensions: [ 2048, 2048 ],
  data,
};


const colors = [
  "#DE86B0", "#466DCA",
  "#E6A7D2", "#E08FA0",
  "#9EAAE6"
  // "#8A5080",
  // "#99331D",
]

const sketch = () => {
  return async ({ context, width, height, data }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.globalAlpha = 1

    random.setSeed(data.seed)
    let colors = _.range(1, data.numColors + 1).map(i => (
      data[`color${i}`]
    ))

    const positions = _.range(0, 29).map(i => [
      random.range(0, width),
      random.range(0, height),
      random.range(600, 1200),
    ])


    positions.forEach(([x, y, r]) => {
      const color = random.pick(colors)
      let gradient = context.createRadialGradient(
        x, y, 0, x, y, r,
      )
      context.globalCompositeOperation = random.pick([
        ..._.range(0, data.darkness).map(() => "multiply"),
        ..._.range(0, 100 - data.darkness).map(() => "screen"),
        ..._.range(0, 100 - data.darkness).map(() => "overlay"),
      ])

      gradient.addColorStop(0, color);
      gradient.addColorStop(1, `${color}00`);
      context.fillStyle = gradient;

      context.beginPath()
      context.ellipse(x, y, r, r, Math.PI / 4, 0, 2 * Math.PI)
      context.fill()
      context.fill()
      context.fill()
    })

    const savedImage = context.getImageData(0, 0, width, height)
    context.translate(width, 0);
    context.scale(-1, 1)
    const flippedImage = context.getImageData(0, 0, width, height)

    context.putImageData(savedImage, 0, 0)

    context.globalCompositeOperation = "normal"
    context.fillStyle = data.circleColor
    context.beginPath()
    context.ellipse(width / 2, height * 0.45, width * 0.4, width * 0.4, Math.PI / 4, 0, 2 * Math.PI)
    context.fill()

    const bufferCanvas = document.createElement('canvas')
    bufferCanvas.width = width
    bufferCanvas.height = height
    var context2 = bufferCanvas.getContext('2d')

    context2.putImageData(
      flippedImage,
      width * 0.03, height * 0.12,
      width * 0.03, height * 0.12,
      width * 0.85, height * 0.06,
    )
    context2.putImageData(
      flippedImage,
      width * 0.03, height * 0.18,
      width * 0.03, height * 0.18,
      width * 0.85, height * 0.06,
    )
    context2.putImageData(
      flippedImage,
      width * 0.03, height * 0.24,
      width * 0.03, height * 0.24,
      width * 0.85, height * 0.06,
    )

    const rotation = 0.1
    const xTranslation = 90

    context.rotate(rotation)
    context.translate(xTranslation, 0);
    context.drawImage(bufferCanvas, 0, 0)
    context.translate(-xTranslation, 0);
    context.rotate(-rotation)

    if (data.imageName) {
      try {
        const image = new Image()
        const imgPromise = onload2promise(image)
        image.src = `/images/${data.imageName}`
        await imgPromise
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
        context.globalAlpha = 1
        // context.putImageData(savedImage, 0, 0)
        const duotoneImage = Filters.duotone(context, image, width, height, data.color1, data.color2, data.filter)
        // context.putImageData(duotoneImage, 0, 0)
        context.globalCompositeOperation = data.mode || "overlay"
        // context.globalCompositeOperation = "destination-in"
        context.drawImage(
          duotoneImage,
          0, 0,
          // 500, 500,
          // image.naturalWidth, image.naturalWidth,
          // width * 0.05, height * 0.1,
          // width * 0.9, height * 0.9,
        )
        // context.globalCompositeOperation = "normal"
      } catch(e) {
        console.log(e)
      }
    }

    context.globalCompositeOperation = "normal"
    context.fillStyle = data.textColor || "#1b1a25"
    // context.font = "900 390px Inter";
    // context.fillText("/newline", 120, (height / 2) + 8);
    // context.font = "200 262px Inter";
    // context.fillText("PODCAST".split("").join(String.fromCharCode(8202)), 275, (height / 2) + 300);


    if (data.guest) {
      const path = new Path2D("M1317.48 1080.62C1339.17 1080.62 1356.82 1064.27 1356.82 1044.17C1356.82 1024.07 1339.17 1007.72 1317.48 1007.72C1295.78 1007.72 1278.14 1024.07 1278.14 1044.17C1278.14 1064.27 1295.78 1080.62 1317.48 1080.62ZM269.731 1015.82H202.043L106.587 1370.46H174.274L269.731 1015.82ZM372.202 1200.95C372.347 1178.97 384.785 1165.66 404.6 1165.66C424.704 1165.66 436.563 1178.97 436.419 1200.95V1325.91H516.255V1184.17C516.4 1135.87 485.883 1100.87 438.733 1100.87C406.046 1100.87 380.157 1117.93 370.467 1145.99H368.153V1103.76H292.366V1325.91H372.202V1200.95ZM770.879 1254.18C763.358 1300.46 723.729 1329.96 662.116 1329.96C590.957 1329.96 547.568 1287.3 547.568 1215.41C547.568 1146.57 591.536 1100.87 660.381 1100.87C727.49 1100.87 770.879 1144.11 770.879 1214.84V1233.35H626.248V1236.82C626.248 1258.23 640.132 1273.85 663.852 1273.85C680.195 1273.85 693.357 1266.76 697.985 1254.18H770.879ZM662.116 1156.98C642.591 1156.98 626.681 1170.15 626.248 1189.38H697.406C696.972 1170.29 681.931 1156.98 662.116 1156.98ZM840.013 1325.91H926.213L957.454 1206.74H959.768L991.008 1325.91H1077.21L1132.75 1103.76H1052.91L1028.61 1237.98H1026.88L997.372 1103.76H919.849L891.502 1239.13H889.766L864.311 1103.76H784.474L840.013 1325.91ZM1157.05 1029.71H1236.88V1325.91H1157.05V1029.71ZM1510.31 1165.66C1490.49 1165.66 1478.05 1178.97 1477.91 1200.95V1325.91H1398.07V1103.76H1473.86V1145.99H1476.17C1485.86 1117.93 1511.75 1100.87 1544.44 1100.87C1591.59 1100.87 1622.11 1135.87 1621.96 1184.17V1325.91H1542.13V1200.95C1542.27 1178.97 1530.41 1165.66 1510.31 1165.66ZM1277.56 1325.91H1357.4V1103.76H1277.56V1325.91ZM1767.82 1329.96C1829.44 1329.96 1869.07 1300.46 1876.59 1254.18H1803.69C1799.06 1266.76 1785.9 1273.85 1769.56 1273.85C1745.84 1273.85 1731.96 1258.23 1731.96 1236.82V1233.35H1876.59V1214.84C1876.59 1144.11 1833.2 1100.87 1766.09 1100.87C1697.24 1100.87 1653.28 1146.57 1653.28 1215.41C1653.28 1287.3 1696.67 1329.96 1767.82 1329.96ZM1731.96 1189.38C1732.39 1170.15 1748.3 1156.98 1767.82 1156.98C1787.64 1156.98 1802.68 1170.29 1803.11 1189.38H1731.96ZM653.323 1480.96C653.323 1434.1 625.843 1404.88 587.949 1404.88C550.056 1404.88 522.576 1434.1 522.576 1480.96C522.576 1527.82 550.056 1557.03 587.949 1557.03C625.843 1557.03 653.323 1527.82 653.323 1480.96ZM635.967 1480.96C635.967 1519.43 614.851 1540.26 587.949 1540.26C561.048 1540.26 539.932 1519.43 539.932 1480.96C539.932 1442.49 561.048 1421.66 587.949 1421.66C614.851 1421.66 635.967 1442.49 635.967 1480.96ZM295.24 1555.01H313.174V1500.92H345.571C380.066 1500.92 395.614 1479.95 395.614 1453.77C395.614 1427.59 380.066 1406.91 345.282 1406.91H295.24V1555.01ZM313.174 1485.01V1422.82H344.704C368.785 1422.82 377.969 1435.98 377.969 1453.77C377.969 1471.56 368.785 1485.01 344.993 1485.01H313.174ZM903.619 1480.67C903.619 1526.95 878.164 1555.01 833.039 1555.01H787.335V1406.91H835.064C878.164 1406.91 903.619 1434.68 903.619 1480.67ZM805.27 1422.82V1539.1H831.882C868.618 1539.1 886.263 1516.83 886.263 1480.67C886.263 1444.8 868.618 1422.82 833.907 1422.82H805.27ZM1156.74 1453.19C1151.24 1422.82 1126.94 1404.88 1097.15 1404.88C1059.25 1404.88 1031.77 1434.1 1031.77 1480.96C1031.77 1527.82 1059.25 1557.03 1097.15 1557.03C1126.94 1557.03 1151.24 1539.1 1156.74 1508.73H1138.8C1134.46 1529.27 1116.82 1540.26 1097.15 1540.26C1070.25 1540.26 1049.13 1519.43 1049.13 1480.96C1049.13 1442.49 1070.25 1421.66 1097.15 1421.66C1116.82 1421.66 1134.46 1432.65 1138.8 1453.19H1156.74ZM1310.54 1513.07L1295.65 1555.01H1276.85L1331.23 1406.91H1349.74L1404.12 1555.01H1385.32L1370.42 1513.07H1310.54ZM1339.91 1430.34L1316.19 1497.16H1364.78L1341.06 1430.34H1339.91ZM1612.04 1443.93H1629.4C1628.6 1421.59 1607.99 1404.88 1579.35 1404.88C1551.01 1404.88 1528.73 1421.37 1528.73 1446.25C1528.73 1466.21 1543.2 1478.07 1566.34 1484.72L1584.56 1489.93C1600.18 1494.26 1614.07 1499.76 1614.07 1514.51C1614.07 1530.71 1598.45 1541.41 1577.91 1541.41C1560.26 1541.41 1544.64 1533.6 1543.2 1516.83H1524.68C1526.42 1541.13 1546.09 1557.61 1577.91 1557.61C1612.04 1557.61 1631.42 1538.81 1631.42 1514.8C1631.42 1487.03 1605.1 1478.07 1589.77 1474.02L1574.73 1469.97C1563.73 1467.07 1546.09 1461.29 1546.09 1445.38C1546.09 1431.21 1559.11 1420.79 1578.78 1420.79C1596.71 1420.79 1610.31 1429.32 1612.04 1443.93ZM1803.24 1422.82H1756.67V1406.91H1867.74V1422.82H1821.17V1555.01H1803.24V1422.82Z")
      context.fill(path)
      context.globalAlpha = 1

      context.globalCompositeOperation = "overlay"
      const guestString = `with ${data.guest}`
      const fontSize = width / (guestString.length * (3 - data.guestFontSize * 3))
      context.font = `600 ${fontSize}px Inter`;
      context.fillText(guestString, 120, height - 160);

      context.globalAlpha = 0.3
      context.globalCompositeOperation = "darken"
      context.fillText(guestString, 120, height - 160);

      context.globalCompositeOperation = "difference"
      context.globalAlpha = 1
      context.fillText(guestString, 120, height - 155);
  } else {
      const path = new Path2D("M1317.48 1390.62C1339.17 1390.62 1356.82 1374.27 1356.82 1354.17C1356.82 1334.07 1339.17 1317.72 1317.48 1317.72C1295.78 1317.72 1278.14 1334.07 1278.14 1354.17C1278.14 1374.27 1295.78 1390.62 1317.48 1390.62ZM269.731 1325.82H202.043L106.587 1680.46H174.274L269.731 1325.82ZM372.202 1510.95C372.347 1488.97 384.785 1475.66 404.6 1475.66C424.704 1475.66 436.563 1488.97 436.419 1510.95V1635.91H516.255V1494.17C516.4 1445.87 485.883 1410.87 438.733 1410.87C406.046 1410.87 380.157 1427.93 370.467 1455.99H368.153V1413.76H292.366V1635.91H372.202V1510.95ZM770.879 1564.18C763.358 1610.46 723.729 1639.96 662.116 1639.96C590.957 1639.96 547.568 1597.3 547.568 1525.41C547.568 1456.57 591.536 1410.87 660.381 1410.87C727.49 1410.87 770.879 1454.11 770.879 1524.84V1543.35H626.248V1546.82C626.248 1568.23 640.132 1583.85 663.852 1583.85C680.195 1583.85 693.357 1576.76 697.985 1564.18H770.879ZM662.116 1466.98C642.591 1466.98 626.681 1480.15 626.248 1499.38H697.406C696.972 1480.29 681.931 1466.98 662.116 1466.98ZM840.013 1635.91H926.213L957.454 1516.74H959.768L991.008 1635.91H1077.21L1132.75 1413.76H1052.91L1028.61 1547.98H1026.88L997.372 1413.76H919.849L891.502 1549.13H889.766L864.311 1413.76H784.474L840.013 1635.91ZM1157.05 1339.71H1236.88V1635.91H1157.05V1339.71ZM1510.31 1475.66C1490.49 1475.66 1478.05 1488.97 1477.91 1510.95V1635.91H1398.07V1413.76H1473.86V1455.99H1476.17C1485.86 1427.93 1511.75 1410.87 1544.44 1410.87C1591.59 1410.87 1622.11 1445.87 1621.96 1494.17V1635.91H1542.13V1510.95C1542.27 1488.97 1530.41 1475.66 1510.31 1475.66ZM1277.56 1635.91H1357.4V1413.76H1277.56V1635.91ZM1767.82 1639.96C1829.44 1639.96 1869.07 1610.46 1876.59 1564.18H1803.69C1799.06 1576.76 1785.9 1583.85 1769.56 1583.85C1745.84 1583.85 1731.96 1568.23 1731.96 1546.82V1543.35H1876.59V1524.84C1876.59 1454.11 1833.2 1410.87 1766.09 1410.87C1697.24 1410.87 1653.28 1456.57 1653.28 1525.41C1653.28 1597.3 1696.67 1639.96 1767.82 1639.96ZM1731.96 1499.38C1732.39 1480.15 1748.3 1466.98 1767.82 1466.98C1787.64 1466.98 1802.68 1480.29 1803.11 1499.38H1731.96ZM653.323 1790.96C653.323 1744.1 625.843 1714.88 587.949 1714.88C550.056 1714.88 522.576 1744.1 522.576 1790.96C522.576 1837.82 550.056 1867.03 587.949 1867.03C625.843 1867.03 653.323 1837.82 653.323 1790.96ZM635.967 1790.96C635.967 1829.43 614.851 1850.26 587.949 1850.26C561.048 1850.26 539.932 1829.43 539.932 1790.96C539.932 1752.49 561.048 1731.66 587.949 1731.66C614.851 1731.66 635.967 1752.49 635.967 1790.96ZM295.24 1865.01H313.174V1810.92H345.571C380.066 1810.92 395.614 1789.95 395.614 1763.77C395.614 1737.59 380.066 1716.91 345.282 1716.91H295.24V1865.01ZM313.174 1795.01V1732.82H344.704C368.785 1732.82 377.969 1745.98 377.969 1763.77C377.969 1781.56 368.785 1795.01 344.993 1795.01H313.174ZM903.619 1790.67C903.619 1836.95 878.164 1865.01 833.039 1865.01H787.335V1716.91H835.064C878.164 1716.91 903.619 1744.68 903.619 1790.67ZM805.27 1732.82V1849.1H831.882C868.618 1849.1 886.263 1826.83 886.263 1790.67C886.263 1754.8 868.618 1732.82 833.907 1732.82H805.27ZM1156.74 1763.19C1151.24 1732.82 1126.94 1714.88 1097.15 1714.88C1059.25 1714.88 1031.77 1744.1 1031.77 1790.96C1031.77 1837.82 1059.25 1867.03 1097.15 1867.03C1126.94 1867.03 1151.24 1849.1 1156.74 1818.73H1138.8C1134.46 1839.27 1116.82 1850.26 1097.15 1850.26C1070.25 1850.26 1049.13 1829.43 1049.13 1790.96C1049.13 1752.49 1070.25 1731.66 1097.15 1731.66C1116.82 1731.66 1134.46 1742.65 1138.8 1763.19H1156.74ZM1310.54 1823.07L1295.65 1865.01H1276.85L1331.23 1716.91H1349.74L1404.12 1865.01H1385.32L1370.42 1823.07H1310.54ZM1339.9 1740.34L1316.19 1807.16H1364.78L1341.06 1740.34H1339.9ZM1612.04 1753.93H1629.4C1628.6 1731.59 1607.99 1714.88 1579.35 1714.88C1551.01 1714.88 1528.73 1731.37 1528.73 1756.25C1528.73 1776.21 1543.2 1788.07 1566.34 1794.72L1584.56 1799.93C1600.18 1804.26 1614.07 1809.76 1614.07 1824.51C1614.07 1840.71 1598.45 1851.41 1577.91 1851.41C1560.26 1851.41 1544.64 1843.6 1543.2 1826.83H1524.68C1526.42 1851.13 1546.09 1867.61 1577.91 1867.61C1612.04 1867.61 1631.42 1848.81 1631.42 1824.8C1631.42 1797.03 1605.1 1788.07 1589.77 1784.02L1574.73 1779.97C1563.73 1777.07 1546.09 1771.29 1546.09 1755.38C1546.09 1741.21 1559.11 1730.79 1578.78 1730.79C1596.71 1730.79 1610.31 1739.32 1612.04 1753.93ZM1803.24 1732.82H1756.67V1716.91H1867.74V1732.82H1821.17V1865.01H1803.24V1732.82Z")
      context.fill(path)
    }

  }
}

(async () => {
  const manager = await canvasSketch(sketch, settings);

  // Can disable this entirely
  const useGUI = true;
  if (useGUI) {
    const gui = new GUI();
    // gui.useLocalStorage = true
    // readLocalStorage();

    // Setup parameters
    addColor(gui, data, "color1").name("color 1")
    addColor(gui, data, "color2").name("color 2")
    addColor(gui, data, "color3").name("color 3")
    addColor(gui, data, "color4").name("color 4")
    addColor(gui, data, "color5").name("color 5")
    addColor(gui, data, "color6").name("color 6")
    addColor(gui, data, "textColor").name("text color")
    addColor(gui, data, "circleColor").name("circle color")
    add(gui, data, "filter")
    add(gui, data, "guest")
    add(gui, data, "guestFontSize", 0, 1, 0.01)
    add(gui, data, "imageName")
    add(gui, data, "mode", modes)
    add(gui, data, "numColors", 0, 6, 1)
    add(gui, data, "darkness", 0, 100, 1)
    add(gui, data, "seed", _.range(0, 1000))
    // add(gui, data, "number", 0, 1, 0.01);
  }

  // Helper functions
  function addColor(gui, ...args) {
    return gui.addColor(...args).onChange(newValue => (
      render(args[1], newValue)
    ));
  }

  function add(gui, ...args) {
    return gui.add(...args).onChange(newValue => (
      render(args[1], newValue)
    ));
  }

  function render(...args) {
    manager.render();
    putLocalStorage(...args)
  }
})()


function putLocalStorage (key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function getLocalStorage (key) {
  return JSON.parse(
    window.localStorage.getItem(key)
  )
}



function grayScale(context, width, height) {
  var imgData = context.getImageData(0, 0, width, height);
      var pixels  = imgData.data;
      for (var i = 0, n = pixels.length; i < n; i += 4) {
      var grayscale = pixels[i] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;
      pixels[i  ] = grayscale;        // red
      pixels[i+1] = grayscale;        // green
      pixels[i+2] = grayscale;        // blue
      //pixels[i+3]              is alpha
  }
  //redraw the image in black & white
  context.putImageData(imgData, 0, 0);
}

function onload2promise(obj){
  return new Promise((resolve, reject) => {
      obj.onload = () => resolve(obj);
      obj.onerror = reject;
  });
}

let Filters = {}
Filters.getPixels = function(ctx, image, width, height, filter) {
  // var c = this.getCanvas(img.width, img.height);
  // var ctx = c.getContext('2d');
  const bufferCanvas = document.createElement('canvas')
  bufferCanvas.width = width
  bufferCanvas.height = height
  var context2 = bufferCanvas.getContext('2d')
  context2.filter = filter
  context2.drawImage(
    image,
    0, 0,
    // 500, 500,
    image.naturalWidth, image.naturalWidth,
    -width * 0.06, width * 0.05,
    width * 1.05, width * 1.05,
  )
  return [
    bufferCanvas,
    context2,
    context2.getImageData(0, 0, width, height),
  ]
};

Filters.grayscale = function(pixels) {
  var d = pixels.data;
  var max = 0;
  var min = 255;
  for (var i=0; i < d.length; i+=4) {
    // Fetch maximum and minimum pixel values
    if (d[i] > max) { max = d[i]; }
    if (d[i] < min) { min = d[i]; }
    // Grayscale by averaging RGB values
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var v = 0.3333*r + 0.3333*g + 0.3333*b;
    d[i] = d[i+1] = d[i+2] = v;
  }
  for (var i=0; i < d.length; i+=4) {
    // Normalize each pixel to scale 0-255
    var v = (d[i] - min) * 255/(max-min);
    d[i] = d[i+1] = d[i+2] = v;
  }
  return pixels;
};

const hexToRgb = hex => color(hex).rgb()

Filters.gradientMap = function (tone1, tone2) {
  var rgb1 = hexToRgb(tone1);
  var rgb2 = hexToRgb(tone2);
  var gradient = [];
  for (var i = 0; i < (256*4); i += 4) {
    gradient[i] = ((256-(i/4))*rgb1.r + (i/4)*rgb2.r)/256;
    gradient[i+1] = ((256-(i/4))*rgb1.g + (i/4)*rgb2.g)/256;
    gradient[i+2] = ((256-(i/4))*rgb1.b + (i/4)*rgb2.b)/256;
    gradient[i+3] = 255;
  }
  return gradient;
};

Filters.duotone = function(ctx, img, width, height, tone1, tone2, filter) {
  var [
    bufferCanvas,
    context2,
    pixels,
  ] = this.getPixels(ctx, img, width, height, filter);
  pixels = Filters.grayscale(pixels);
  var gradient = this.gradientMap(tone1, tone2);
  // pixels = contrastImage(pixels, 60)
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    if (d[i + 3]) {
      d[i] = gradient[d[i]*4];
      d[i+1] = gradient[d[i+1]*4 + 1];
      d[i+2] = gradient[d[i+2]*4 + 2];
    } else {
      d[i] = 0
      d[i + 1]  = 0
      d[i + 2]  = 0
      d[i + 3]  = 0
    }
  }

  context2.putImageData(pixels,0,0)

  return bufferCanvas;
};

function contrastImage(imgData, contrast){  //input range [-100..100]
  var d = imgData.data;
  contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
  var intercept = 128 * (1 - contrast);
  for(var i=0;i<d.length;i+=4){   //r,g,b,a
      d[i] = d[i]*contrast + intercept;
      d[i+1] = d[i+1]*contrast + intercept;
      d[i+2] = d[i+2]*contrast + intercept;
  }
  return imgData;
}