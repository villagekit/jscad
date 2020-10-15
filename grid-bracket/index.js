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

const BRACKET_GRIDS = 1
const BRACKET_THICKNESS = 4
const BRACKET_SUPPORT_THICKNESS = 4
const BRACKET_FASTENER_MARGIN = 1

const bracketLength = (BRACKET_GRIDS - 1/2) * GRID_SPACING + (1/2) * FASTENER_CAP_DIAMETER + BRACKET_FASTENER_MARGIN
const bracketWidth = FASTENER_CAP_DIAMETER + 2 * BRACKET_FASTENER_MARGIN
const bracketThickness = BRACKET_THICKNESS

function main() {
  return union(
    plate(),
    plate().rotateZ(90)
  )
}

function plate() {
  let plate = CSG.cube({
    corner1: [0, -(1/2) * bracketThickness, 0],
    corner2: [bracketLength, (1/2) * bracketThickness, bracketWidth]
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
