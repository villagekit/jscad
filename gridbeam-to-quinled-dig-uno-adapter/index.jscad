// title      : Gridbeam to QuinLED-Dig-Uno
// author     : Mikey <mikey@villagekit.com>
// license    : Apache-2.0 License
// revision   : 0.001
// tags       : Logo,Intersection,Sphere,Cube
// file       : logo.jscad

const M2_NUT = { diameter: 2, height: 2 }
const M2_BOLT = { diameter: 2, height: 8 }
const M2_BOLT_DRILL = { diameter: 1.6, height: 8 }
const BOARD = {
  size: {
    x: 48.523 /* + 7 extra for esp2866 */,
    y: 39.370,
    '-z': 3.76,
    z: 22,
    tolerance: 5,
  },
  plate: {
    height: 3
  }
}
const BOARD_UNDER_SPACER = {
  diameter: 5.254,
  height: M2_BOLT_DRILL.height - BOARD.plate.height + 2
}
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
const GRID_BOLT = { diameter: 8, height: 70 }
const GRID_CONNECTORS = [
  {
    location: { x: (BOARD.size.x / 2) - 40, y: BOARD.size.y / 2 },
    bolt: GRID_BOLT
  },
  {
    location: { x: (BOARD.size.x / 2) + 40, y: BOARD.size.y / 2 },
    bolt: GRID_BOLT
  }
]
const CYLINDER_RESOLUTION = 16

function main () {
  return difference(
    union(
      BoardPlate(BOARD_CONNECTORS),
      ...BOARD_CONNECTORS.map(BoardConnectorSpacer),
      GridConnectors(GRID_CONNECTORS)
    ),
    ...BOARD_CONNECTORS.map(BoardConnectorDrillHole),
    ...GRID_CONNECTORS.map(GridConnectorBoltHole)
  )
}

function BoardPlate (boardConnectors) {
  /*
  return CSG.cube({
    corner1: [-BOARD.size.tolerance, -BOARD.size.tolerance, 0],
    corner2: [BOARD.size.x + BOARD.size.tolerance, BOARD.size.y + BOARD.size.tolerance, BOARD.plate.height]
  })
  */
  return linear_extrude(
    { height: BOARD.plate.height },
    chain_hull(
      { closed: true },
      boardConnectors.map(({ location, spacer }) => {
        return CAG.circle({
          center: [location.x, location.y],
          radius: spacer.diameter / 2,
          resolution: CYLINDER_RESOLUTION
        })
      })
    )
  )
}

function BoardConnectorSpacer({ location, spacer }) {
  return CSG.cylinder({
    start: [location.x, location.y, BOARD.plate.height],
    end: [location.x, location.y, BOARD.plate.height + spacer.height],
    radius: spacer.diameter / 2,
  })
}

function BoardConnectorDrillHole({ location, spacer, drill }) {
  return CSG.cylinder({
    start: [location.x, location.y, BOARD.plate.height + spacer.height],
    end: [location.x, location.y, BOARD.plate.height + spacer.height - drill.height],
    radius: drill.diameter / 2,
    resolution: CYLINDER_RESOLUTION
  })
}

function GridConnectors(gridConnectors) {
  return linear_extrude(
    { height: BOARD.plate.height },
    chain_hull(gridConnectors.map(GridConnector2d))
  )
}

function GridConnector2d({ location, bolt }) {
  return CAG.circle({
    center: [location.x, location.y],
    radius: (bolt.diameter + 6) / 2,
    resolution: CYLINDER_RESOLUTION
  })
}
function GridConnectorBoltHole ({ location, bolt }) {
  return CSG.cylinder({
    start: [location.x, location.y, 0],
    end: [location.x, location.y, bolt.height],
    radius: bolt.diameter / 2,
    resolution: CYLINDER_RESOLUTION
  })
}
