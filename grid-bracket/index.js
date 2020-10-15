// title: gridkit.nz bracket
// author: Michael Williams (dinosaur.is)
// license: CC-BY-SA
// description: a grid-compatible angle bracket

const GRID_SPACING = 40
const FASTENER_HOLE_DIAMETER = 8
const FASTENER_CAP_DIAMETER = 13

const LAYER_HEIGHT = 0.2
const CIRCLE_RESOLUTION = 16
const EPSILON = 1e-4
const INFINITY = 1000

const BRACKET_GRIDS = 1
const BRACKET_THICKNESS = 4
const BRACKET_SUPPORT_THICKNESS = 4
const BRACKET_FASTENER_MARGIN = 1
const BRACKET_ROUND_RADIUS = 0.6

const roundRadius = BRACKET_ROUND_RADIUS
const bracketLength = (BRACKET_GRIDS - 1/2) * GRID_SPACING + (1/2) * FASTENER_CAP_DIAMETER + BRACKET_FASTENER_MARGIN
const bracketWidth = FASTENER_CAP_DIAMETER + 2 * BRACKET_FASTENER_MARGIN
const bracketThickness = BRACKET_THICKNESS
const supportThickness = BRACKET_SUPPORT_THICKNESS

function main() {
  return union(
    plate(),
    plate().rotateZ(90),
    support().translate([0, 0, -BRACKET_SUPPORT_THICKNESS]),
    support().translate([0, 0, bracketWidth])
  )
}

function plate() {
  let plate = CSG.roundedCube({
    corner1: [0, -(1/2) * bracketThickness, -supportThickness],
    corner2: [bracketLength, (1/2) * bracketThickness, bracketWidth + supportThickness],
    roundradius: BRACKET_ROUND_RADIUS,
    resolution: CIRCLE_RESOLUTION
  })

  // cut holes for fasteners
  plate = plate.subtract(fastenerCuts())
  
  // translate to a useful position for rotations
  plate = plate.translate([-(1/2) * bracketThickness, 0, 0])
  
  return plate
}

function fastenerCuts() {
  let cuts = []
  for (var i = 0; i < BRACKET_GRIDS; i++) {
    const x = (i + 1/2) * GRID_SPACING
    cuts.push(
      teardrop({
        height: bracketThickness + 2 * EPSILON,
        radius: FASTENER_HOLE_DIAMETER / 2
      })
        .translate([x, -(1/2) * bracketThickness - EPSILON, 1/2 * bracketWidth])
    )
  }
  return union(...cuts)
}

function support() {
  const triangleLength = Math.sqrt(2) * bracketLength
  return CSG.roundedCube({
    corner1: [-(1/2) * triangleLength + roundRadius, -(1/2) * triangleLength + roundRadius, 0],
    corner2: [(1/2) * triangleLength - roundRadius, (1/2) * triangleLength - roundRadius, supportThickness],
    roundradius: BRACKET_ROUND_RADIUS,
    resolution: CIRCLE_RESOLUTION
  })
    .rotateZ(45)
    // subtract negative X
    .subtract(CSG.cube({
      corner1: [0, INFINITY, -INFINITY],
      corner2: [-INFINITY, -INFINITY, INFINITY]
    }))
    // subtract negative Y
    .subtract(CSG.cube({
      corner1: [INFINITY, 0, -INFINITY],
      corner2: [-INFINITY, -INFINITY, INFINITY]
    }))
    // subtract beyond X plate
    .subtract(
      CSG.cube({
        corner1: [bracketLength -(1/2) * bracketThickness - roundRadius, -INFINITY, -INFINITY],
        corner2: [bracketLength + INFINITY, INFINITY, INFINITY],
      })
    )
    // subtract beyond Y plate
    .subtract(
      CSG.cube({
        corner1: [-INFINITY, bracketLength -(1/2) * bracketThickness - roundRadius, -INFINITY],
        corner2: [INFINITY, bracketLength + INFINITY, INFINITY],
      })
    )
}

// https://hydraraptor.blogspot.com/2020/07/horiholes_36.html
// https://hydraraptor.blogspot.com/2020/07/horiholes-2.html
function teardrop({ height, radius, heightCorrection }) {
  const profile = teardrop2d({ radius, heightCorrection })
  return profile
    .extrude({ offset: [0, 0, height] })
    .rotateX(90)
    .mirroredY()
}

function teardrop2d({ radius, heightCorrection = true }) {
  const heightCorrectionOffset = heightCorrection
    ? (1/2) * LAYER_HEIGHT
    : 0
  // a semi-circle with extra radius of 1/2 * layer height
  const semicircle = intersection(
    CAG.circle({
      center: [0, 0],
      radius: radius + heightCorrectionOffset,
      resolution: CIRCLE_RESOLUTION
    }),
    CAG.rectangle({
      center: [radius + heightCorrectionOffset, 0],
      radius: radius + heightCorrectionOffset
    })
  )

  let profile = hull(
    // top pushed down 1/2 * layer height
    translate([-heightCorrectionOffset, 0], semicircle),
    // bottom pushed up 1/2 * layer height
    translate([heightCorrectionOffset, 0], semicircle.mirroredX()),
    // triangle to form teardrop
    polygon({
      points: [
        [-radius, 0],
        [0, 2 * radius],
        [radius, 0],
      ]
    })
  )
  
  // truncate
  profile = intersection(
    profile,
    CAG.rectangle({ center: [0, 0], radius: radius + heightCorrectionOffset })
  )
  
  return profile
}
