import { ManifoldToplevel, Vec3, Vec2, Manifold, CrossSection } from '../manifold_lib/built/manifold';
import { color, green, blue } from './colorgradient';

export const shape = () => {
  const x1 = .5;
  const x2 = 4/2;
  const y = 1.25;
  
  const tooth: [number,number][] = [
    [-x1, y],
    [-x2, -y], 
    [x2, -y], 
    [x1, y]
  ];
  return tooth;
};


export const mainAssembly = (m: ManifoldToplevel) => {
  const { CrossSection } = m;
  
  const radius = 13;
  const circle = CrossSection.circle(radius);

  const tooth = shape();
  let allTeeth = new CrossSection([[0, 0]]); // null one for reduce
  const numTeeth = 24;
  const angleStep = 360 / numTeeth;
  for(let angle = angleStep; angle <= 360; angle += angleStep) {
    allTeeth = allTeeth.add(
      new CrossSection([tooth]).rotate(180)
        .translate(-0, radius)
        .rotate(angle)
    );
  }

  const centerHole = CrossSection.circle(8);

  return green(circle.subtract(allTeeth).subtract(centerHole).extrude(10));
};
