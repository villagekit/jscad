const ROTATION = 2 * Math.PI

function getParameterDefinitions() {
  return [
	{ name: 'radius', caption: 'Radius:', type: 'float', default: 10 },
	{ name: 'height', caption: 'Height:', type: 'float', default: 35 },
	{ name: 'roundRadius', caption: 'Round radius:', type: 'float', default: 1 }
  ];
}

function main(params) {
  return createRoundedHexRecess(params)
}

function createRoundedHexSolid({ radius, height, roundRadius }) {
  const bottomHexagon = createHexagonPolygon({ radius: radius - roundRadius })
  return bottomHexagon.solidFromSlices({
    numslices: 4,
    callback: function (t, slice) {
      switch (slice) {
        case 0:
          return createHexagonPolygon({
            radius: radius - roundRadius,
            zOffset: 0
          })
        case 1:
          return createHexagonPolygon({
            radius: radius,
            zOffset: roundRadius
          })
        case 2:
          return createHexagonPolygon({
            radius: radius,
            zOffset: height - roundRadius
          })
        case 3:
          return createHexagonPolygon({
            radius: radius - roundRadius,
            zOffset: height
          })
      }
    }
  })
}

function createRoundedHexHole({ radius, height, roundRadius }) {
  const bottomHexagon = createHexagonPolygon({ radius: radius + roundRadius })
  return bottomHexagon.solidFromSlices({
    numslices: 4,
    callback: function (t, slice) {
      switch (slice) {
        case 0:
          return createHexagonPolygon({
            radius: radius + roundRadius,
            zOffset: 0
          })
        case 1:
          return createHexagonPolygon({
            radius: radius,
            zOffset: roundRadius
          })
        case 2:
          return createHexagonPolygon({
            radius: radius,
            zOffset: height - roundRadius
          })
        case 3:
          return createHexagonPolygon({
            radius: radius + roundRadius,
            zOffset: height
          })
      }
    }
  })
}

function createRoundedHexRecess({ radius, height, roundRadius }) {
  const bottomHexagon = createHexagonPolygon({ radius: radius + roundRadius })
  return bottomHexagon.solidFromSlices({
    numslices: 3,
    callback: function (t, slice) {
      switch (slice) {
        case 0:
          return createHexagonPolygon({
            radius: radius + roundRadius,
            zOffset: 0
          })
        case 1:
          return createHexagonPolygon({
            radius: radius,
            zOffset: roundRadius
          })
        case 2:
          return createHexagonPolygon({
            radius: radius - roundRadius,
            zOffset: height
          })
      }
    }
  })
}


// https://www.quora.com/How-can-you-find-the-coordinates-in-a-hexagon
function createHexagonPolygon({ radius, zOffset = 0 }) {
  const x = (Math.sqrt(3) / 2)
  const y = (1 / 2)

  return CSG.Polygon.createFromPoints([
    [0, radius, zOffset],
    [x * radius, y * radius, zOffset],
    [x * radius, -y * radius, zOffset],
    [0, -radius, zOffset],
    [-x * radius, -y * radius, zOffset],
    [-x * radius, y * radius, zOffset],
  ])
}
