
import { ManifoldToplevel, Vec3, Vec2, Manifold } from '../manifold_lib/built/manifold';
import { color, green, blue } from './colorgradient';

export const plate = (m: ManifoldToplevel) => {
  const { CrossSection } = m;
  const plate = CrossSection.circle(19/2, 64);
  const holeX = CrossSection.circle(1.5, 64).translate(-5);
  const holeX2 = holeX.mirror([1,0]);
  const holeY = CrossSection.circle(1.5, 64).translate([0,-5]);
  const holeY2 = holeY.mirror([0,1]);
  const shape = plate
    .subtract(holeX)
    .subtract(holeX2)
    .subtract(holeY)
    .subtract(holeY2);
  return shape;
};

export const mainAssembly = (m: ManifoldToplevel) => {
  const { CrossSection, Manifold } = m;
  const shaft = CrossSection.circle(2.5, 64).extrude(30);
  const driveTolerance = Manifold.cylinder(4, 2.0, 2.0, 64);

  return green(
    plate(m).extrude(5)
      .add(shaft)
      .subtract(driveTolerance)
  );
};
