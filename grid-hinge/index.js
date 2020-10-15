// title: gridkit.nz hinge
// author: Michael Williams (dinosaur.is)
// license: CC-BY-SA
// description: a grid-compatible hinge
// attributions:
// - Rohin Gosling's Parametric Caged Bearing
// - J-Max's Perfect (3d Printed) Hinge

const GRID_SPACING = 40
const FASTENER_HOLE_DIAMETER = 8
const FASTENER_CAP_DIAMETER = 13
const FASTENER_CAP_HEIGHT = 3.5

const HINGE_GRID_HEIGHT = 1
const HINGE_GRID_WIDTH = 1
const HINGE_THICKNESS = 6
const HINGE_KNUCKLE_COUNT = 3 // must be odd
const HINGE_KNUCKLE_CLEARANCE = 0.4
const HINGE_KNUCKLE_EVEN_ODD_RATIO = 3/5
const HINGE_FASTENER_MARGIN = (24 - FASTENER_CAP_DIAMETER) / 2
const HINGE_ROUNDRADIUS = 0.5

const LAYER_HEIGHT = 0.2
const CYLINDER_RESOLUTION = 16
const EPSILON = 1e-4

const leafHeight = GRID_SPACING * (HINGE_GRID_HEIGHT - 1) + FASTENER_CAP_DIAMETER + 2 * HINGE_FASTENER_MARGIN
const leafWidth = GRID_SPACING * (HINGE_GRID_WIDTH - 1/2) + (1/2) * FASTENER_CAP_DIAMETER + HINGE_FASTENER_MARGIN
const leafThickness = HINGE_THICKNESS
const knuckleThickness = HINGE_THICKNESS
const knuckleClearance = HINGE_KNUCKLE_CLEARANCE
const pinRadius = HINGE_THICKNESS / 2

const totalClearanceHeight = knuckleClearance * (HINGE_KNUCKLE_COUNT - 1)
const totalKnucklesHeight = (leafHeight - totalClearanceHeight)
const numEvenKnuckles = Math.ceil(HINGE_KNUCKLE_COUNT / 2)
const numOddKnuckles = Math.floor(HINGE_KNUCKLE_COUNT / 2)
const evenKnuckleHeight = totalKnucklesHeight * HINGE_KNUCKLE_EVEN_ODD_RATIO / numEvenKnuckles
const oddKnuckleHeight = totalKnucklesHeight * (1 - HINGE_KNUCKLE_EVEN_ODD_RATIO) / numOddKnuckles

const hingeRotation = 0

// the compenents of a hinge (and the terminology we will use):
// - leaf: the flat solid that connects the knuckles to the fasteners
// - knuckles: the solids which curl around the pin
// - pin: the solid on which the hinge pivots
// - shaft: the empty for the pin to move

function main(params) {
  const knuckles = hingeKnuckles()
  return union(
    difference(
      hingeLeafs(),
      hingeFastenerCuts(),
      knuckles.subtraction
    ),
    knuckles.addition
  )
}

const fastenerPosition = ({ xIndex, yIndex }) => ({
  x: (1/2 + xIndex) * GRID_SPACING,
  y:  yIndex * GRID_SPACING + (1/2) * FASTENER_CAP_DIAMETER + HINGE_FASTENER_MARGIN,
})

const forEachFastener = (handler) => {
  for (let xIndex = 0; xIndex < HINGE_GRID_WIDTH; xIndex++) {
    for (let yIndex = 0; yIndex < HINGE_GRID_HEIGHT; yIndex++) {
      handler(fastenerPosition({ xIndex, yIndex }))
    }
  }
}

function hingeLeafs() {
  return union(
    // even leaf
    hingeLeaf(),
    // odd leaf
    hingeLeaf()
      .mirroredX()
      .rotateZ(hingeRotation)
  )
}

// the hinge leaf is constructed as the hull of:
// - the center line
// - a teardrop to surround each fastener
function hingeLeaf() {
  const fastenerConnectorRadius = ((1/2) * FASTENER_CAP_DIAMETER) + HINGE_FASTENER_MARGIN

  const fastenerConnectors = []
  forEachFastener(({ x, y }) => {
    fastenerConnectors.push(
      teardrop2d({ radius: fastenerConnectorRadius, heightCorrection: false })
        .mirroredY()
        .translate([x, y])
    )
  })

  const profile = hull(
    CAG.rectangle({
      center: [1/2 * leafThickness, 1/2 * leafHeight],
      radius: [1/2 * leafThickness, 1/2 * leafHeight]
    }),
    ...fastenerConnectors
  )

  const leaf = profile
    .extrude({ offset: [0, 0, leafThickness] })
    .translate([0, -1/2 * leafHeight, -1/2 * leafThickness])
    .rotateX(90)
    .translate([0, 1/2 * leafThickness, 1/2 * leafHeight])

  return leaf.subtract(hingeKnucklesCut())
}

// cut to ensure the knuckles have their basic clearance
function hingeKnucklesCut() {
  const cutRadius = 2 * pinRadius + knuckleClearance
  return CSG.cube({
     corner1: [-cutRadius, -cutRadius, -EPSILON],
     corner2: [cutRadius, cutRadius, leafHeight + EPSILON],
  })
}


function hingeFastenerCuts() {
  let cuts = []
  forEachFastener(({ x, y }) => {
    // even fasteners
    cuts.push(
      hingeFastenerCut()
        .translate([x, -EPSILON, y])
    )
    // odd fasteners
    cuts.push(
      hingeFastenerCut()
        .translate([-x, -EPSILON, y])
        .rotateZ(hingeRotation)
    )
  })
  return union(...cuts)
}

// for each fastener, cut out:
// - a through hole for the bolt
// - a recessed hole for the cap
function hingeFastenerCut() {
  return union(
    teardrop({
      height: FASTENER_CAP_HEIGHT + EPSILON,
      radius: FASTENER_CAP_DIAMETER / 2
    }),
    teardrop({
      height: leafThickness + 2 * EPSILON,
      radius: FASTENER_HOLE_DIAMETER / 2
    })
  )
}

function hingeKnuckles() {
  const additions = []
  const subtractions = []

  for (var i = 0; i < HINGE_KNUCKLE_COUNT; i++) {
    const isEven = i % 2 === 0
    const startHeight = Math.floor(i / 2) * (evenKnuckleHeight + oddKnuckleHeight)
      + (i % 2) * evenKnuckleHeight
      + i * knuckleClearance
    const knuckleHeight = isEven ? evenKnuckleHeight : oddKnuckleHeight
    const knuckleHoleHeight = knuckleHeight + 2 * knuckleClearance

    const outerCylinder = CSG.cylinder({
      start: [0, 0, startHeight],
      end: [0, 0, startHeight + knuckleHeight],
      radius: pinRadius * 2,
      resolution: CYLINDER_RESOLUTION,
    })
    
    if (isEven) {
      const connector = translate(
        [0, 0, startHeight],
        hingeKnuckleConnector({ height: knuckleHeight})
      )
      const connectorHole = translate(
        [0, 0, startHeight - knuckleClearance],
        hingeKnuckleConnector({ height: knuckleHoleHeight }).mirroredY()
      ).mirroredX()
      
      additions.push(
        union(
          outerCylinder,
          connector
        )
      )
      subtractions.push(connectorHole)
    } else {
      const connector = translate(
        [0, 0, startHeight],
        hingeKnuckleConnector({ height: knuckleHeight }).mirroredX()
      )
      const connectorHole = translate(
        [0, 0, startHeight - knuckleClearance],
        hingeKnuckleConnector({ height: knuckleHoleHeight }).mirroredX().mirroredY()
      ).mirroredX()
      
      const shaftHole = translate(
        [0, 0, startHeight - knuckleClearance],
        hingeShaft({
          height: knuckleHeight + 2 * knuckleClearance,
          radius: pinRadius + knuckleClearance
        })
      )
      const shaft = translate(
        [0, 0, startHeight - knuckleClearance],
        hingeShaft({
          height: knuckleHeight + 2 * knuckleClearance,
          radius: pinRadius
        })
      )
    
      additions.push(
        union(
          difference(
            union(
              outerCylinder,
              connector
            ),
            shaftHole
          ),
          shaft
        )
      )
      subtractions.push(connectorHole)
    }
  }
  
  return {
    addition: union(...additions),
    subtraction: union(...subtractions)
  }
}

function hingeKnuckleConnector({ height }) {
  let path = new CSG.Path2D([[0, 0], [0, -knuckleThickness]])
  path = path.appendBezier([
    [0, -knuckleThickness],
    [knuckleThickness, -knuckleThickness],
    [knuckleThickness, 0],
    [knuckleThickness * 2, 0]
  ], { resolution: CYLINDER_RESOLUTION })
  path = path.close()
  const profile = path.innerToCAG()
  const gusset = linear_extrude({ height }, profile)

  return union(
    gusset,
    CSG.cube({
      corner1: [0, 0, 0],
      corner2: [knuckleThickness + knuckleClearance, leafThickness, height]
    })
  )
}

function hingeShaft({ height, radius }) {
  let path = new CSG.Path2D([[0, 0], [radius, 0]])
  path = path.appendBezier([
    [radius, 0],
    [0, height / 2],
    [radius, height]
  ], { resolution: CYLINDER_RESOLUTION })
  path = path.appendPoint([0, height])
  path = path.close()

  const profile = path.innerToCAG()

  return rotate_extrude({
    fn: CYLINDER_RESOLUTION
  }, profile)
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
      resolution: CYLINDER_RESOLUTION
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
