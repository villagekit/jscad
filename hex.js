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

function createRoundedHexRecess({ radius, height, center = [], roundRadius }) {
  const [centerX = 0, centerY = 0, centerZ = 0] = center

  const bottomHexagon = createHexagonPolygon({ radius: radius + roundRadius })
  return bottomHexagon.solidFromSlices({
    numslices: 3,
    callback: function (t, slice) {
      switch (slice) {
        case 0:
          return createHexagonPolygon({
            radius: radius + roundRadius,
            center: [centerX, centerY, centerZ - (1/2) * height],
          })
        case 1:
          return createHexagonPolygon({
            radius: radius,
            center: [centerX, centerY, centerZ - (1/2) * height + roundRadius],
          })
        case 2:
          return createHexagonPolygon({
            radius: radius - roundRadius,
            center: [centerX, centerY, centerZ + (1/2) * height],
          })
      }
    }
  })
}


// https://www.quora.com/How-can-you-find-the-coordinates-in-a-hexagon
function createHexagonPolygon({ radius, center = [] }) {
  const [centerX = 0, centerY = 0, centerZ = 0] = center
  const circle = CAG.circle({
    radius,
    center: [centerX, centerY],
    resolution: 6
  })

  return cagToPolygon(circle, {
    zOffset: centerZ
  })
}

function cagToPolygon (cag, { zOffset }) {
  const points2d = cag.toPoints()

  const points3d = points2d.map(({ _x: x, _y: y }) => {
    return [x, y, zOffset]
  })

  return CSG.Polygon.createFromPoints(points3d)
}
