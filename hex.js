const ROTATION = 2 * Math.PI

function getParameterDefinitions() {
  return [
	{ name: 'radius', caption: 'Radius:', type: 'float', default: 10 },
	{ name: 'height', caption: 'Height:', type: 'float', default: 35 },
	{ name: 'roundRadius', caption: 'Round radius:', type: 'float', default: 1 }
  ];
}

function main(params) {
  return createRoundedHexSolid(params)
}

function createRoundedHexSolid({ radius, height, roundRadius }) {
  const bottomHexagon = createHexagon({ radius })
  return roundedLinearExtrude(bottomHexagon, { height, roundRadius })
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



function createHexagon({ radius, center = [] }) {
  const [centerX = 0, centerY = 0] = center

  return CAG.circle({
    radius,
    center: [centerX, centerY],
    resolution: 6
  })
}

function createHexagonPolygon({ radius, center = [] }) {
  const [centerX = 0, centerY = 0, centerZ = 0] = center
  const hexagon = createHexagon({
    radius,
    center: [centerX, centerY],
  })

  return cagToPolygon(hexagon, {
    zOffset: centerZ
  })
}

function cagToPolygon (cag, { zOffset = 0}) {
  const points2d = cag.toPoints()

  const points3d = points2d.map(({ _x: x, _y: y }) => {
    return [x, y, zOffset]
  })

  return CSG.Polygon.createFromPoints(points3d)
}

function roundedLinearExtrude(cag, { height, roundRadius }) {
  const polygon = cagToPolygon(cag, { zOffset: 0 })
  const boundingSphere = polygon.boundingSphere()
  const [_, boundingRadius] = boundingSphere
  const roundUpScale = (boundingRadius + roundRadius) / boundingRadius
  const roundDownScale = (boundingRadius - roundRadius) / boundingRadius

  return polygon.solidFromSlices({
    numslices: 4,
    callback: function (t, slice) {
      switch (slice) {
        case 0:
          return this.scale(roundDownScale)
        case 1:
          return this.translate([0, 0, roundRadius])
        case 2:
          return this.translate([0, 0, height - roundRadius])
        case 3:
          return this.scale(roundDownScale).translate([0, 0, height])
      }
    }
  })
}
