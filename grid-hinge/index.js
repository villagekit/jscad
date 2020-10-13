// title: gridkit.nz hinge
// author: Michael Williams
// license: CC-BY-SA
// description: a grid-compatible hinge
// attributions:
// - Rohin Gosling's Parametric Caged Bearing
// - J-Max's Perfect (3d Printed) Hinge

const GRID_SPACING = 40
const HOLE_DIAMETER = 8

const HINGE_GRID_HEIGHT = 2
const HINGE_GRID_WIDTH = 1
const HINGE_THICKNESS = 4
const HINGE_KNUCKLE_COUNT = 3
const HINGE_KNUCKLE_CLEARANCE = 0.5

const LAYER_HEIGHT = 0.3
const CYLINDER_RESOLUTION = 64
const EPSILON = 1e-4

const leafHeight = GRID_SPACING * HINGE_GRID_HEIGHT
const leafWidth = GRID_SPACING * HINGE_GRID_WIDTH
const leafThickness = HINGE_THICKNESS
const knuckleThickness = HINGE_THICKNESS
const knuckleClearance = HINGE_KNUCKLE_CLEARANCE
const pinRadius = HINGE_THICKNESS / 2

const totalClearanceHeight = knuckleClearance * (HINGE_KNUCKLE_COUNT - 1)
const knuckleHeight = (leafHeight - totalClearanceHeight) / HINGE_KNUCKLE_COUNT
const knuckleHoleHeight = knuckleHeight + 2 * knuckleClearance

const hingeRotation = 0

function main(params) {
  const knuckles = hingeKnuckles()
  return union(
    difference(
      union(
        hingeLeaf(),
        rotate(
          [0, 0, hingeRotation],
          hingeLeaf().mirroredX()
        )
      ),
      hingeKnucklesCut(),
      ...hingeBoltCuts(),
      ...knuckles.subtractions
    ),
    ...knuckles.additions
  )
}


function hingeLeaf() {
  return CSG.cube({
    corner1: [0, 0, 0],
    corner2: [leafWidth, leafThickness, leafHeight],
  })
}

function hingeBoltCuts() {
  let bolts = []
  
  for (let xIndex = 0; xIndex < HINGE_GRID_WIDTH; xIndex++) {
    for (let yIndex = 0; yIndex < HINGE_GRID_HEIGHT; yIndex++) {
      const x = (1/2 + xIndex) * GRID_SPACING
      const y = (1/2 + yIndex) * GRID_SPACING
      bolts.push(
        translate(
          [x, -EPSILON, y],
          teardrop({
            height: leafThickness + 2 * EPSILON,
            radius: HOLE_DIAMETER / 2
          })
        )
      )
      bolts.push(
        translate(
          [-x, -EPSILON, y],
          teardrop({
            height: leafThickness + 2 * EPSILON,
            radius: HOLE_DIAMETER / 2
          })
        )
      )
    }
  }
  
  return bolts
}

function hingeKnucklesCut() {
  const cutRadius = 2 * pinRadius + knuckleClearance
  return CSG.cube({
     corner1: [-cutRadius, -cutRadius, -EPSILON],
     corner2: [cutRadius, cutRadius, leafHeight + EPSILON],
  })
}

function hingeKnuckles() {
  const additions = []
  const subtractions = []

  for (var i = 0; i < HINGE_KNUCKLE_COUNT; i++) {
    const isEven = i % 2 === 0
    const startHeight = i * (knuckleHeight + knuckleClearance)

    const outerCylinder = CSG.cylinder({
      start: [0, 0, startHeight],
      end: [0, 0, startHeight + knuckleHeight],
      radius: pinRadius * 2,
      resolution: CYLINDER_RESOLUTION,
    })
    
    if (isEven) {
      const gusset = translate(
        [0, 0, startHeight],
        hingeGusset({ height: knuckleHeight})
      )
      const gussetHole = translate(
        [0, 0, startHeight - knuckleClearance],
        hingeGusset({ height: knuckleHoleHeight }).mirroredY()
      ).mirroredX()
      
      additions.push(
        union(
          outerCylinder,
          gusset
        )
      )
      subtractions.push(gussetHole)
    } else {
      const gusset = translate(
        [0, 0, startHeight],
        hingeGusset({ height: knuckleHeight }).mirroredX()
      )
      const gussetHole = translate(
        [0, 0, startHeight - knuckleClearance],
        hingeGusset({ height: knuckleHoleHeight }).mirroredX().mirroredY()
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
              gusset
            ),
            shaftHole
          ),
          shaft
        )
      )
      subtractions.push(gussetHole)
    }
  }
  
  return {
    additions,
    subtractions
  }
}

function hingeGusset({ height }) {
  let path = new CSG.Path2D([[0, 0], [0, -knuckleThickness]])
  path = path.appendBezier([
    [0, -knuckleThickness],
    [knuckleThickness, -knuckleThickness],
    [knuckleThickness, 0],
    [knuckleThickness * 2, 0]
  ], { resolution: CYLINDER_RESOLUTION })
  path = path.close()
  const profile = path.innerToCAG()
  const strengthener = linear_extrude({ height }, profile)

    
  return union(
    strengthener,
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
function teardrop({ height, radius }) {
  const offset = (1/2) * LAYER_HEIGHT
  // a semi-circle with extra radius of 1/2 * layer height
  const semicircle = intersection(
    CAG.circle({
      center: [0, 0],
      radius: radius + offset,
      fn: CYLINDER_RESOLUTION
    }),
    CAG.rectangle({ center: [radius + offset, 0], radius: radius + offset })
  )

  let profile = hull(
    // top pushed down 1/2 * layer height
    translate([-offset, 0], semicircle),
    // bottom pushed up 1/2 * layer height
    translate([offset, 0], semicircle.mirroredX()),
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
    CAG.rectangle({ center: [0, 0], radius: radius * 1.2 /* ??? */ })
  )

  return rotate([90, 0, 0], linear_extrude({ height }, profile)).mirroredY()
}
