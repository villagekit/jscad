// title: gridkit.nz hinge
// author: Michael Williams
// license: CC-BY-SA
// description: a grid-compatible hinge
// attributions: inspired by Rohin Gosling's Parametric Caged Bearing

const GRID_SPACING = 40
const HOLE_DIAMETER = 8

const HINGE_GRID_HEIGHT = 2
const HINGE_GRID_WIDTH = 1
const HINGE_THICKNESS = 4
const HINGE_KNUCKLE_COUNT = 3
const HINGE_PIN_RADIUS = HINGE_THICKNESS / 2
const HINGE_KNUCKLE_CLEARANCE = 0.5

const CYLINDER_RESOLUTION = 16
const EPSILON = 1e-4

const leafHeight = GRID_SPACING * HINGE_GRID_HEIGHT
const leafWidth = GRID_SPACING * HINGE_GRID_WIDTH
const leafThickness = HINGE_THICKNESS
const knuckleThickness = HINGE_THICKNESS
const knuckleClearance = HINGE_KNUCKLE_CLEARANCE
const pinRadius = HINGE_PIN_RADIUS

const totalClearanceHeight = knuckleClearance * (HINGE_KNUCKLE_COUNT - 1)
const knuckleHeight = (leafHeight - totalClearanceHeight) / HINGE_KNUCKLE_COUNT
  
const hingeRotation = 0

function main(params) {
  return union(
    difference(
      union(
        hingeLeafPlate(),
        rotate(
          [0, 0, hingeRotation],
          hingeLeafPlate().mirroredX()
        )
      ),
      hingeKnucklesCut()
    ),
    hingeKnuckles(),
    hingePin()
  )
}

function hingeLeafPlate() {

  return CSG.cube({
    corner1: [0, 0, 0],
    corner2: [leafWidth, leafThickness, leafHeight],
  })
}

function hingeKnucklesCut() {
  const cutRadius = pinRadius + knuckleThickness + 2 * knuckleClearance
  return CSG.cube({
     corner1: [-cutRadius, -cutRadius, -EPSILON],
     corner2: [cutRadius, cutRadius, leafHeight + EPSILON],
  })
}

function hingeKnuckles() {
  const knuckles = []

  for (var i = 0; i < HINGE_KNUCKLE_COUNT; i++) {
    const isEven = i % 2 === 0
    const startHeight = i * (knuckleHeight + knuckleClearance)

    const outerCylinder = CSG.cylinder({
      start: [0, 0, startHeight],
      end: [0, 0, startHeight + knuckleHeight],
      radius: pinRadius + knuckleThickness + knuckleClearance,
      resolution: CYLINDER_RESOLUTION,
    })
    
    if (isEven) {
      const gusset = CSG.cube({
        corner1: [0, 0, startHeight],
        corner2: [leafWidth, leafThickness, startHeight + knuckleHeight]
      })
      knuckles.push(
        union(
          outerCylinder,
          gusset
        )
      )
    } else {
      const gusset = CSG.cube({
        corner1: [0, 0, startHeight],
        corner2: [-leafWidth, leafThickness, startHeight + knuckleHeight]
      })
      const innerCylinder = CSG.cylinder({
        start: [0, 0, startHeight],
        end: [0, 0, startHeight + knuckleHeight],
        radius: pinRadius + knuckleClearance,
        resolution: CYLINDER_RESOLUTION,
      })
    
      knuckles.push(
        difference(
          union(
            outerCylinder,
            gusset
          ),
          innerCylinder
        )
      )
    }
  }
  
  return knuckles
}

function hingePin() {
  return CSG.cylinder({
    start: [0, 0, 0],
    end: [0, 0, leafHeight],
    radius: pinRadius,
    resolution: CYLINDER_RESOLUTION,
  })
}
