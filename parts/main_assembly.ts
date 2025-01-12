import { ManifoldToplevel, Vec2, Manifold } from '../manifold_lib/built/manifold';
import { color, blue } from './colorgradient';

const createFanInterface = (
  m: ManifoldToplevel,
  interfaceHeight: number,
  lipDiameter: number,
  fanDiameter: number,
  magnetHeight: number,
  magnetDiameter: number,
  magnetDrop: number,
  numMagnets: number
) => {
  const lipCylinder = m.Manifold.cylinder(
    interfaceHeight,
    lipDiameter / 2,
    lipDiameter / 2,
    64,
    false
  );
  const mainCylinder = m.Manifold.cylinder(
    interfaceHeight,
    fanDiameter / 2 - 2,
    fanDiameter / 2 - 2,
    64,
    false
  );
  const base = lipCylinder.subtract(mainCylinder);
  const magnetRadius = fanDiameter / 2 + (lipDiameter - fanDiameter) / 4;

  let magnetHoles: Manifold[] = [];
  for (let i = 0; i < numMagnets; i++) {
    const angle = (i * 2 * Math.PI) / numMagnets;
    const magnetHole = m.Manifold.cylinder(
      magnetHeight,
      magnetDiameter / 2,
      magnetDiameter / 2,
      32,
      false
    ).translate([
      magnetRadius * Math.cos(angle),
      magnetRadius * Math.sin(angle),
      interfaceHeight - magnetHeight - magnetDrop
    ]);
    magnetHoles.push(magnetHole);
  }

  return base.subtract(m.Manifold.union(magnetHoles));
};

const createVerticalPipe = (
  m: ManifoldToplevel,
  verticalHeight: number,
  fanDiameter: number,
  clearance: number,
  wallThickness: number
) => {
  const radius = fanDiameter / 2 - clearance;
  const outer = m.Manifold.cylinder(verticalHeight, radius, radius, 32, false);
  const innerRadius = radius - wallThickness;
  const inner = m.Manifold.cylinder(verticalHeight, innerRadius, innerRadius, 32, false);
  return outer.subtract(inner);
};

const createRibs = (
  m: ManifoldToplevel,
  fanDiameter: number,
  clearance: number,
  numRibs: number,
  ribHeight: number,
  ribWidth: number,
  ribTaper: number,
  ribProtrusion: number,
  ribFillet: number = 2 // <-- new param for the "rounding" height
) => {
  const radius = fanDiameter / 2 - clearance;
  let ribs: Manifold[] = [];
  for (let i = 0; i < numRibs; i++) {
    const angle = (i * 2 * Math.PI) / numRibs;

    // Original rib
    const fullRib = m.Manifold.cylinder(
      ribHeight,
      ribWidth / 2,
      ribWidth / 2 - ribTaper / 2,
      32
    );
    const cutter = m.Manifold.cube([ribWidth * 2, ribWidth * 2, ribHeight])
      .translate([-ribWidth * 2, -ribWidth, 0]);
    const positionedRib = fullRib
      .subtract(cutter)
      .rotate([0, 0, (angle * 180) / Math.PI])
      .translate([
        (radius + ribProtrusion / 2) * Math.cos(angle),
        (radius + ribProtrusion / 2) * Math.sin(angle),
        1
      ]);

    // Fillet piece: small conical frustum
    const fillet = m.Manifold.cylinder(
      ribFillet,
      (ribWidth / 2) + ribFillet,
      (ribWidth / 2),
      32
    )
      .rotate([0, 0, (angle * 180) / Math.PI])
      .translate([
        (radius + ribProtrusion / 2) * Math.cos(angle),
        (radius + ribProtrusion / 2) * Math.sin(angle),
        1 - ribFillet // put fillet base on the flange
      ]);

    // Rib plus fillet
    ribs.push(positionedRib.add(fillet));
  }
  return m.Manifold.union(ribs);
};

export const mainAssembly = (m: ManifoldToplevel) => {
  const INCH_TO_MM = 25.4;
  const FAN_DIAMETER = 4 * INCH_TO_MM;
  const CLEARANCE = 0.4;
  const WALL_THICKNESS = 2;
  const VERTICAL_HEIGHT = 30;
  const NUM_RIBS = 12;
  const RIB_HEIGHT = VERTICAL_HEIGHT - 2;
  const RIB_WIDTH = 3;
  const RIB_TAPER = 3;
  const RIB_PROTRUSION = -.6;

  const INTERFACE_HEIGHT = 4;
  const LIP_DIAMETER = FAN_DIAMETER + 15;
  const MAGNET_DIAMETER = 6.04;
  const MAGNET_HEIGHT = 3;
  const MAGNET_DROP = 0.8;
  const NUM_MAGNETS = 8;

  const pipe = createVerticalPipe(
    m,
    VERTICAL_HEIGHT,
    FAN_DIAMETER - 2,
    CLEARANCE,
    WALL_THICKNESS
  );

  const ribs = createRibs(
    m,
    FAN_DIAMETER - 2,
    CLEARANCE,
    NUM_RIBS,
    RIB_HEIGHT,
    RIB_WIDTH,
    RIB_TAPER,
    RIB_PROTRUSION
  );

  const fanInterface = createFanInterface(
    m,
    INTERFACE_HEIGHT,
    LIP_DIAMETER,
    FAN_DIAMETER - 4,
    MAGNET_HEIGHT,
    MAGNET_DIAMETER,
    MAGNET_DROP,
    NUM_MAGNETS
  );

  
  const combined = m.Manifold.union([
      //pipe,
      ribs,
      fanInterface
  ]);


  return blue(combined);

};
