import { ManifoldToplevel, Vec2, Manifold } from '../manifold_lib/built/manifold';
import { color, blue } from './colorgradient';

// Constants for the design (all in mm)
const MAGNET_DIAMETER = 6.04;
const MAGNET_HEIGHT = 3;
const MAGNET_DROP = .8;

const INCH_TO_MM = 25.4;
const FAN_DIAMETER = 4 * INCH_TO_MM - 2;
const WALL_THICKNESS = 2;
const INTERFACE_HEIGHT = 4;
const NUM_MAGNETS = 8;
const LIP_DIAMETER = FAN_DIAMETER + 15;

const VERTICAL_ARM_LENGTH = 80;
const HORIZONTAL_ARM_LENGTH = 80;
const CLEARANCE = 0.4;

const createFanInterface = (m: ManifoldToplevel) => {
  // Create bigger lip cylinder
  const lipCylinder = m.Manifold.cylinder(
    INTERFACE_HEIGHT,
    LIP_DIAMETER/2,
    LIP_DIAMETER/2,
    64,
    false
  );

  // Create fan hole cylinder
  const mainCylinder = m.Manifold.cylinder(
    INTERFACE_HEIGHT,
    FAN_DIAMETER/2-2,
    FAN_DIAMETER/2-2,
    64,
    false
  );

  // Create the base by subtracting fan hole from lip
  const base = lipCylinder.subtract(mainCylinder);

  // Add magnet holes
  let magnetHoles = [];
  const magnetRadius = FAN_DIAMETER/2 + (LIP_DIAMETER - FAN_DIAMETER)/4;

  for (let i = 0; i < NUM_MAGNETS; i++) {
    const angle = (i * 2 * Math.PI) / NUM_MAGNETS;
    const magnetHole = m.Manifold.cylinder(
      MAGNET_HEIGHT,
      MAGNET_DIAMETER/2,
      MAGNET_DIAMETER/2,
      32,
      false
    ).translate([
      magnetRadius * Math.cos(angle),
      magnetRadius * Math.sin(angle),
      INTERFACE_HEIGHT - MAGNET_HEIGHT - MAGNET_DROP
    ]);
    magnetHoles.push(magnetHole);
  }

  return base.subtract(m.Manifold.union(magnetHoles));
};

const createElbow = (m: ManifoldToplevel) => {
    const radius = (FAN_DIAMETER/2) - CLEARANCE;
    
    const vertical = m.Manifold.cylinder(VERTICAL_ARM_LENGTH, radius, radius, 32, false);
    const horizontal = m.Manifold.cylinder(HORIZONTAL_ARM_LENGTH, radius, radius, 32, false)
        .rotate([90, 0, 0])
        .translate([0, 0, VERTICAL_ARM_LENGTH]);
    const corner = m.Manifold.sphere(radius, 32).translate([0, 0, VERTICAL_ARM_LENGTH]);
    
    const outer = m.Manifold.union([vertical, horizontal, corner]);
    
    const innerRadius = radius - WALL_THICKNESS;
    const innerV = m.Manifold.cylinder(VERTICAL_ARM_LENGTH, innerRadius, innerRadius, 32, false);
    const innerH = m.Manifold.cylinder(HORIZONTAL_ARM_LENGTH, innerRadius, innerRadius, 32, false)
        .rotate([90, 0, 0])
        .translate([0, 0, VERTICAL_ARM_LENGTH]);
    const innerC = m.Manifold.sphere(innerRadius, 32).translate([0, 0, VERTICAL_ARM_LENGTH]);
    
    return outer.subtract(m.Manifold.union([innerV, innerH, innerC]));
};

export const mainAssembly = (m: ManifoldToplevel) => {
    // Create the elbow pipe
    const elbow = createElbow(m);
    
    // Create the fan interface and position it at the bottom of the elbow
    const fanInterface = createFanInterface(m);
    
    // Combine them
    const combined = m.Manifold.union([
        elbow,
        fanInterface
    ]);

    return blue(combined);
};
