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
  const hexagon = createHexagon({ radius })
  return roundedLinearExtrude(hexagon, { height, roundRadius, style: 'solid' })
}

function createRoundedHexHole({ radius, height, roundRadius }) {
  const hexagon = createHexagon({ radius })
  return roundedLinearExtrude(hexagon, { height, roundRadius, style: 'hole' })
}

function createRoundedHexRecess({ radius, height, roundRadius }) {
  const hexagon = createHexagon({ radius })
  return roundedLinearExtrude(hexagon, { height, roundRadius, style: 'recess' })
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

function cagToPolygon (cag, { zOffset = 0 }) {
  const points2d = cag.toPoints()

  const points3d = points2d.map(({ x, y }) => {
    return [x, y, zOffset]
  })

  return CSG.Polygon.createFromPoints(points3d)
}

function roundedLinearExtrude(cag, options) {
  const {
    height,
    roundRadius,
    style = 'solid'
  } = options

  const polygon = cagToPolygon(cag, { zOffset: 0 })
  const boundingBox = polygon.boundingBox()
  const [minPoint, maxPoint] = boundingBox
  const radius = maxPoint.minus(minPoint).dividedBy(2)
  const roundUpScale = [
    (radius.x + roundRadius) / radius.x,
    (radius.y + roundRadius) / radius.y,
  ]
  const roundDownScale = [
    (radius.x - roundRadius) / radius.x,
    (radius.y - roundRadius) / radius.y,
  ]

  return polygon.solidFromSlices({
    numslices: 4,
    callback: function (t, slice) {
      if (style === 'solid') {
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
      } else if (style === 'hole') {
        switch (slice) {
          case 0:
            return this.scale(roundUpScale)
          case 1:
            return this.translate([0, 0, roundRadius])
          case 2:
            return this.translate([0, 0, height - roundRadius])
          case 3:
            return this.scale(roundUpScale).translate([0, 0, height])
        }
      } else if (style === 'recess') {
        switch (slice) {
          case 0:
            return this.scale(roundUpScale)
          case 1:
            return this.translate([0, 0, roundRadius])
          case 2:
            return null
          case 3:
            return this.translate([0, 0, height])
        }
      }
    },
  })
}
