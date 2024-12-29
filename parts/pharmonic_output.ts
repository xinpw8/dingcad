import { color, green, blue } from './colorgradient';
import { ManifoldToplevel, Vec3, Vec2, Manifold } from '../manifold_lib/built/manifold';

export const plate = (m: ManifoldToplevel) => {
  const { CrossSection } = m;
  const plate = CrossSection.circle(72.5/2, 64);
  const radius = 72.5/2 - 5;
  const holes = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    holes.push(CrossSection.circle(1.5, 64).translate([x, y]));
  }
  let shape = CrossSection.circle(40, 64);;
  for (const hole of holes) {
    shape = shape.subtract(hole);
  }
  return shape;
};

export const mainAssembly = (m: ManifoldToplevel) => {
  const { CrossSection, Manifold } = m;

  // base plate - extrude it a bit
  const basePlate = Manifold.extrude(plate(m), 2);

  // create tapered cylinder for the raised portion
  // outer radius matches where we want the slope to start (10mm from edge)
  const outerRadius = 72.5/2 - 10;
  // top radius slightly smaller to create gentle slope
  const innerRadius = outerRadius - 15;
  const raisedHeight = 18;

  const raisedCenter = Manifold.cylinder(
    raisedHeight,
    outerRadius,  // bottom radius
    innerRadius,  // top radius slightly smaller
    64,
    false
  ).translate(0,0,2);

  const hole = Manifold.cylinder(
    13,
    22/2,  // bottom radius
    22/2,  // top radius slightly smaller
    64,
    false
  );

  const m8 = Manifold.cylinder(40, 4);

  // combine them - move the cylinder up to sit on the base
  return green(Manifold.union(
    basePlate,
    raisedCenter
  ).subtract(hole).subtract(m8))
};
