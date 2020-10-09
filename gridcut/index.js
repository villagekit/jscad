// title: gridkit.nz cutting jig
// author: Michael Williams
// license: CC-BY
// description: a jig to help accurately cut to the grid

const GRID_SPACING = 40
const HOLE_DIAMETER = 8
const JIG_BASE_GRIDS = 4
const JIG_BASE_HEIGHT = 10
const JIG_HOLE_HEIGHT = 10
const JIG_HOLE_TOLERANCE = 0.3
const CYLINDER_RESOLUTION = 16

function main(params) {
    return union(
        jigBase(),
        jigHoles()
    )
}

function jigBase () {
    const jigLength = GRID_SPACING * JIG_BASE_GRIDS
    const jigWidth = GRID_SPACING
    const jigHeight = JIG_BASE_HEIGHT
    
    return CSG.cube({
        corner1: [0, 0, 0],
        corner2: [jigLength, jigWidth, jigHeight]
    })
}

function jigHoles () {
    var holes = []
    for (var holeIndex = 0; holeIndex < JIG_BASE_GRIDS; holeIndex++) {
        const hole = translate(
            [((1/2) + holeIndex) * GRID_SPACING, (1/2) * GRID_SPACING, 0],
            jigHole()
        )
        holes.push(hole)
    }
    return holes
}

function jigHole () {
    return CSG.cylinder({
      start: [0, 0, 0],
      end: [0, 0, JIG_BASE_HEIGHT + JIG_HOLE_HEIGHT],
      radius: HOLE_DIAMETER / 2,
      resolution: CYLINDER_RESOLUTION,
      center: true
    })
}
