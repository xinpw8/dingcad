import { ManifoldToplevel, Vec3, Vec2, Manifold } from '../manifold_lib/built/manifold';
import { color, green, blue } from './colorgradient';

const makeM8NutShape = (m: ManifoldToplevel, depth: number) => {
  const { CrossSection, Manifold } = m;
  
  const width = 15; // m8 nut width across flats
  const radius = width/2;
  
  const points: Vec2[] = Array.from({length: 6}, (_, i) => {
    const angle = i * Math.PI / 3;
    return [
      radius * Math.cos(angle), 
      radius * Math.sin(angle)
    ];
  });

  const hexagon = new CrossSection([points]);
  return color(Manifold.extrude(hexagon, depth));
};


export const makeSpur = (m: ManifoldToplevel) => {
  const { CrossSection } = m;


  const x1 = .5/2;
  const x2 = 4/2/2;
  const y = 1.25/2;
  
  const tooth: [number,number][] = [
    [-x1, y],
    [-x2, -y], 
    [x2, -y], 
    [x1, y]
  ];
  
  const radius = (13+0.3)/2;
  const circle = CrossSection.circle(radius);

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

  const centerHole = CrossSection.circle(7.8/2);

  return circle
    .subtract(allTeeth)
    .subtract(centerHole)
};


export const mainAssembly = (m: ManifoldToplevel) => {
  const { Manifold } = m;
  const startRadius = 19/2;
  const totalHeight = 10;
  let result = green(Manifold.cylinder(totalHeight, startRadius));
  
  // mounting holes
  const boltShaft = Manifold.cylinder(totalHeight + 1, 1.5, 1.5, 32);
  const boltHead = Manifold.cylinder(30, 2.5, 2.5, 32);

  const mountingHole = Manifold.union(
    boltShaft,
    boltHead.translate(0,0,totalHeight-1)
  );
  const m8BoltDiameter = 8;
  const nutHeight = 5;
  const boltLength = 55;
  const shaftLength = boltLength - nutHeight;
  const boltShaftHole = Manifold.cylinder(shaftLength, m8BoltDiameter/2, m8BoltDiameter/2, 32);
  const nutHead = makeM8NutShape(m, nutHeight).translate(0, 0, shaftLength);
  const driveHole = Manifold.cylinder(4, 2.0, 2.0, 64);

  const holes = [-6, 6].flatMap(x => [
    mountingHole.translate(x, 0, 0),
    mountingHole.translate(0, x, 0)
  ]);

  const spur = makeSpur(m);
  result = result.add(green(spur.extrude(40).translate(0,0,10)))
  result = holes.reduce((acc, h) => acc.subtract(blue(h)), result);


  return result
    .add(nutHead)
    .subtract(driveHole)
    .subtract(blue(boltShaftHole))
    .subtract(blue(boltShaftHole));
};
