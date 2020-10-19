// title: gridkit.nz bracket
// author: Michael Williams (dinosaur.is)
// license: CC-BY-SA
// description: a grid-compatible angle bracket

const GRID_SPACING = 40
const FASTENER_HOLE_DIAMETER = 8
const FASTENER_CAP_DIAMETER = 13

const LAYER_HEIGHT = 0.2
const CIRCLE_RESOLUTION = 32
const ROUNDING_RESOLUTION = 8
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
  return difference(
    union(
      bottomPlate(),
      sidePlate(),
      support().translate([-supportThickness, 0, 0]),
      support().translate([bracketWidth, 0, 0])
    ),
    bottomFastenersCut(),
    sideFastenersCut()
  )
}

function bottomPlate() {
  return CSG.roundedCube({
    corner1: [-supportThickness, 0, 0],
    corner2: [bracketWidth + supportThickness, bracketLength, bracketThickness],
    roundradius: BRACKET_ROUND_RADIUS,
    resolution: ROUNDING_RESOLUTION
  })
}

function bottomFastenersCut() {
  return mapFastenersCut(x => {
    return teardrop({
        height: bracketThickness + 2 * EPSILON,
        radius: FASTENER_HOLE_DIAMETER / 2
      })
      .translate([(1/2) * bracketWidth, -EPSILON, x])
  })
}

function sidePlate() {
  return CSG.roundedCube({
    corner1: [-supportThickness, 0, 0],
    corner2: [bracketWidth + supportThickness, bracketThickness, bracketLength],
    roundradius: BRACKET_ROUND_RADIUS,
    resolution: ROUNDING_RESOLUTION
  })
}

function sideFastenersCut() {
  return mapFastenersCut(x => {
    return CSG.cylinder({
      start: [(1/2) * bracketWidth, x, -EPSILON],
      end: [(1/2) * bracketWidth, x, bracketThickness],
      radius: FASTENER_HOLE_DIAMETER / 2,
      resolution: CIRCLE_RESOLUTION
    })
  })
}

function mapFastenersCut(mapper) {
  let cuts = []
  for (var i = 0; i < BRACKET_GRIDS; i++) {
    const x = (i + 1/2) * GRID_SPACING
    cuts.push(mapper(x))
  }
  return union(...cuts)
}

function support() {
  const triangleLength = Math.sqrt(2) * bracketLength
  return CSG.roundedCube({
    corner1: [0, -(1/2) * triangleLength, -(1/2) * triangleLength],
    corner2: [supportThickness, (1/2) * triangleLength, (1/2) * triangleLength],
    roundradius: BRACKET_ROUND_RADIUS,
    resolution: ROUNDING_RESOLUTION
  })
    .rotateX(45)
    // subtract behind bottom plate
    .subtract(CSG.cube({
      corner1: [INFINITY, INFINITY, (1/2) * bracketThickness],
      corner2: [-INFINITY, -INFINITY, -INFINITY]
    }))
    // subtract behind side plate
    .subtract(CSG.cube({
      corner1: [INFINITY, (1/2) * bracketThickness, INFINITY],
      corner2: [-INFINITY, -INFINITY, -INFINITY]
    }))
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
