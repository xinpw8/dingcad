import { ManifoldToplevel, Vec3, Vec2, Manifold } from '../manifold_lib/built/manifold';
import { color, green, blue, red } from './colorgradient';

// Constants for the design (all in mm)
const MAGNET_DIAMETER = 6;
const MAGNET_HEIGHT = 3;
const MAGNET_HOLE_DEPTH = 2.5;
const COVER_MAGNET_DEPTH = 0.5;

const INCH_TO_MM = 25.4;
const FAN_DIAMETER = 4 * INCH_TO_MM;
const RING_WIDTH = 5;
const TOTAL_HEIGHT = 5;
const COVER_HEIGHT = 2;
const NUM_MAGNETS = 4;

// Tab dimensions - updated for new design
const TAB_WIDTH = 12; // Skinnier width
const TAB_LENGTH = 15; // Reduced from 20 to 15
const TAB_CIRCLE_DIAMETER = TAB_WIDTH; // End circle diameter same as width
const TAB_OFFSET = (TAB_LENGTH / 2) - (RING_WIDTH / 2); // Adjusted to center properly

const createTab = (m: ManifoldToplevel, height: number, angle: number, centerPoint: Vec2) => {
  // Create the rectangular base of the tab, positioned at origin
  const tabRect = m.Manifold.cube([TAB_WIDTH, TAB_LENGTH - TAB_CIRCLE_DIAMETER/2, height], true);
  
  // Create the rounded end circle
  const tabCircle = m.Manifold.cylinder(
    height,
    TAB_CIRCLE_DIAMETER/2,
    TAB_CIRCLE_DIAMETER/2,
    32,
    true
  );
  
  // Position the circle at the outer end of the rectangle
  const circleOffset = (TAB_LENGTH - TAB_CIRCLE_DIAMETER/2) / 2;
  const positionedCircle = tabCircle.translate([0, circleOffset, 0]);
  
  // Combine rectangle and circle
  const tab = m.Manifold.union([tabRect, positionedCircle]);
  
  // First rotate the tab so it points radially outward
  const rotatedTab = tab.rotate([0, 0, (angle * 180 / Math.PI) - 90]); // Subtract 90 degrees to make it point outward
  
  // Then translate it outward from the center by the offset
  const offsetDistance = TAB_OFFSET;
  const offsetX = offsetDistance * Math.cos(angle);
  const offsetY = offsetDistance * Math.sin(angle);
  
  return rotatedTab.translate([
    centerPoint[0] + offsetX, 
    centerPoint[1] + offsetY, 
    height/2
  ]);
};

const createMagnetHole = (m: ManifoldToplevel, depth: number, angle: number, centerPoint: Vec2, zOffset: number) => {
  const hole = m.Manifold.cylinder(
    depth,
    MAGNET_DIAMETER / 2,
    MAGNET_DIAMETER / 2,
    32,
    false
  );

  const offsetDistance = TAB_OFFSET;
  const offsetX = offsetDistance * Math.cos(angle);
  const offsetY = offsetDistance * Math.sin(angle);

  return hole.translate([
    centerPoint[0] + offsetX,
    centerPoint[1] + offsetY,
    zOffset
  ]);
};

export const createFanInterface = (m: ManifoldToplevel) => {
  // Create thin outer ring
  const outerRingRadius = (FAN_DIAMETER / 2) + RING_WIDTH;
  const outerRing = m.Manifold.cylinder(
    TOTAL_HEIGHT,
    outerRingRadius,
    outerRingRadius,
    64,
    false
  );

  const innerHole = m.Manifold.cylinder(
    TOTAL_HEIGHT,
    FAN_DIAMETER / 2,
    FAN_DIAMETER / 2,
    64,
    false
  );

  const baseRing = outerRing.subtract(innerHole);

  // Create tabs and magnet holes
  let tabs = [];
  let magnetHoles = [];
  const magnetPlacementRadius = (FAN_DIAMETER / 2) + (RING_WIDTH / 2);

  for (let i = 0; i < NUM_MAGNETS; i++) {
    const angle = (i * 2 * Math.PI) / NUM_MAGNETS;
    const centerPoint: Vec2 = [
      magnetPlacementRadius * Math.cos(angle),
      magnetPlacementRadius * Math.sin(angle)
    ];

    tabs.push(createTab(m, TOTAL_HEIGHT, angle, centerPoint));
    magnetHoles.push(createMagnetHole(
      m, 
      MAGNET_HOLE_DEPTH, 
      angle, 
      centerPoint, 
      TOTAL_HEIGHT - MAGNET_HOLE_DEPTH
    ));
  }

  const allTabs = m.Manifold.union(tabs);
  const baseWithTabs = m.Manifold.union([baseRing, allTabs]);
  const allMagnetHoles = m.Manifold.union(magnetHoles);

  return baseWithTabs.subtract(allMagnetHoles);
};

export const createCoverPlate = (m: ManifoldToplevel) => {
  // Create thin outer ring
  const outerRingRadius = (FAN_DIAMETER / 2) + RING_WIDTH;
  const outerRing = m.Manifold.cylinder(
    COVER_HEIGHT,
    outerRingRadius,
    outerRingRadius,
    64,
    false
  );

  const innerHole = m.Manifold.cylinder(
    COVER_HEIGHT,
    FAN_DIAMETER / 2,
    FAN_DIAMETER / 2,
    64,
    false
  );

  const baseRing = outerRing.subtract(innerHole);

  // Create tabs and magnet holes
  let tabs = [];
  let magnetHoles = [];
  const magnetPlacementRadius = (FAN_DIAMETER / 2) + (RING_WIDTH / 2);

  for (let i = 0; i < NUM_MAGNETS; i++) {
    const angle = (i * 2 * Math.PI) / NUM_MAGNETS;
    const centerPoint: Vec2 = [
      magnetPlacementRadius * Math.cos(angle),
      magnetPlacementRadius * Math.sin(angle)
    ];

    tabs.push(createTab(m, COVER_HEIGHT, angle, centerPoint));
    magnetHoles.push(createMagnetHole(
      m, 
      COVER_MAGNET_DEPTH, 
      angle, 
      centerPoint, 
      0
    ));
  }

  const allTabs = m.Manifold.union(tabs);
  const baseWithTabs = m.Manifold.union([baseRing, allTabs]);
  const allMagnetHoles = m.Manifold.union(magnetHoles);

  return baseWithTabs.subtract(allMagnetHoles);
};

export const mainAssembly = (m: ManifoldToplevel) => {
  const fanInterface = createFanInterface(m);
  const coverPlate = createCoverPlate(m);
  
  const stackedCover = coverPlate.translate([0, 0, TOTAL_HEIGHT]);
  return blue(m.Manifold.union([
    color(fanInterface),
    red(stackedCover).translate(0, 0, 5)
  ]));
};
