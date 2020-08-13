// title      : Gridbeam to QuinLED-Dig-Uno
// author     : Mikey <mikey@villagekit.com>
// license    : Apache-2.0 License
// revision   : 0.001
// tags       : Logo,Intersection,Sphere,Cube
// file       : logo.jscad

const M2_NUT = { diameter: 2, height: 2 }
const M2_BOLT = { diameter: 2, height: 8 }
const M2_BOLT_DRILL = { diameter: 1.6, height: 8 }
const BOARD_SIZE = { x: 48.523 + 7 /* extra for esp2866 */ , y: 39.370}
const BOARD_SIZE_TOLERANCE = 5
const PLATE_THICKNESS = 3
const BOARD_UNDER_SPACER = { diameter: 5.254, height: M2_BOLT_DRILL.height - PLATE_THICKNESS + 2 }
const BOARD_ABOVE_SPACE = 22
const BOARD_CONNECTORS = [
  {
    location: { x: 2.627, y: 2.673 },
    bolt: M2_BOLT,
    nut: M2_NUT,
    drill: M2_BOLT_DRILL,
    spacer: BOARD_UNDER_SPACER
  },
  {
    location: { x: 2.627, y: 36.697 },
    bolt: M2_BOLT,
    nut: M2_NUT,
    drill: M2_BOLT_DRILL,
    spacer: BOARD_UNDER_SPACER
  },
  {
    location: { x: 45.896, y: 2.673 },
    bolt: M2_BOLT,
    nut: M2_NUT,
    drill: M2_BOLT_DRILL,
    spacer: BOARD_UNDER_SPACER
  },
  {
    location: { x: 45.896, y: 36.697 },
    bolt: M2_BOLT,
    nut: M2_NUT,
    drill: M2_BOLT_DRILL,
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
    ...BOARD_CONNECTORS.map(BoardConnectorDrillHole)
    // ...BOARD_CONNECTORS.map(BoardConnectorBoltHole),
    // ...BOARD_CONNECTORS.map(BoardConnectorNutHole)
  )
}

function BoardPlate () {
  return CSG.cube({
    corner1: [-BOARD_SIZE_TOLERANCE, -BOARD_SIZE_TOLERANCE, 0],
    corner2: [BOARD_SIZE.x + BOARD_SIZE_TOLERANCE, BOARD_SIZE.y + BOARD_SIZE_TOLERANCE, PLATE_THICKNESS]
  })
}

function BoardConnectorSpacer({ location, spacer }) {
  return CSG.cylinder({
    start: [location.x, location.y, PLATE_THICKNESS],
    end: [location.x, location.y, PLATE_THICKNESS + spacer.height],
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

function BoardConnectorDrillHole({ location, spacer, drill }) {
  return CSG.cylinder({
    start: [location.x, location.y, PLATE_THICKNESS + spacer.height],
    end: [location.x, location.y, PLATE_THICKNESS + spacer.height - drill.height],
    radius: drill.diameter / 2,
    resolution: CYLINDER_RESOLUTION
  })
}

function GridConnector() {}
function GridConnectorBoltHole () {}
function GridConnectorHeadHole () {}

function hexDiameter (diameter) {
  return diameter * ( 2 / sqrt (3))
}
