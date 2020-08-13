// title      : Gridbeam to QuinLED-Dig-Uno
// author     : Mikey <mikey@villagekit.com>
// license    : Apache-2.0 License
// revision   : 0.001
// tags       : Logo,Intersection,Sphere,Cube
// file       : logo.jscad

const M2_5_NUT = { diameter: 2.5, height: 2 }
const M2_5_BOLT = { diameter: 2.5 }
const BOARD_PLATE_SIZE = { x: 50, y: 30, z: 5 }
const BOARD_UNDER_SPACER = { diameter: 5.254, height: 2 }
const BOARD_CONNECTORS = [
  {
    location: { x: 5, y: 5 },
    bolt: M2_5_BOLT,
    nut: M2_5_NUT,
    spacer: BOARD_UNDER_SPACER
  },
  {
    location: { x: 5, y: 25 },
    bolt: M2_5_BOLT,
    nut: M2_5_NUT,
    spacer: BOARD_UNDER_SPACER
  },
  {
    location: { x: 45, y: 5 },
    bolt: M2_5_BOLT,
    nut: M2_5_NUT,
    spacer: BOARD_UNDER_SPACER
  },
  {
    location: { x: 45, y: 25 },
    bolt: M2_5_BOLT,
    nut: M2_5_NUT,
    spacer: BOARD_UNDER_SPACER
  }
]
const GRID_BOLT_HOLE_DIAMETER = 8
const CYLINDER_RESOLUTION = 16

function main () {
  return difference(
    union(
      BoardPlate(),
      ...BOARD_CONNECTORS.map(BoardConnectorSpacer)
    ),
    ...BOARD_CONNECTORS.map(BoardConnectorBoltHole),
    ...BOARD_CONNECTORS.map(BoardConnectorNutHole)
  )
}

function BoardPlate () {
  return CSG.cube({
    corner1: [0, 0, 0],
    corner2: [BOARD_PLATE_SIZE.x, BOARD_PLATE_SIZE.y, BOARD_PLATE_SIZE.z]
  })
}

function BoardConnectorSpacer({ location, spacer }) {
  return CSG.cylinder({
    start: [location.x, location.y, BOARD_PLATE_SIZE.z],
    end: [location.x, location.y, BOARD_PLATE_SIZE.z + spacer.height],
    radius: spacer.diameter / 2,
  })
}

function BoardConnectorBoltHole({ location, bolt }) {
  return CSG.cylinder({
    start: [location.x, location.y, -100],
    end: [location.x, location.y, 100],
    radius: bolt.diameter / 2,
    resolution: CYLINDER_RESOLUTION
  })
}

function BoardConnectorNutHole({ location, nut }) {
  return CSG.cylinder({
    start: [location.x, location.y, 0],
    end: [location.x, location.y, 1],
    radius: hexDiameter(nut.diameter) / 2,
    resolution: 6
  })
}
function GridConnector() {}
function GridConnectorBoltHole () {}
function GridConnectorHeadHole () {}

function hexDiameter (diameter) {
  return diameter * ( 2 / sqrt (3))
}
