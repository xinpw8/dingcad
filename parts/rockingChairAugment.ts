import { ManifoldToplevel, Vec2 } from '../manifold_lib/built/manifold';
import { green, blue, color } from './colorgradient';

export const parabola = (x: number): number => {
  return (x * x) / 1100;
};

export const parabolaSlope = (x: number): number => {
  return (2 * x) / 1100;
};

export const paroblaCrossSection = (m: ManifoldToplevel, thickness: number) => {
  let startX = -100;
  let endX = 100;
  const { CrossSection } = m;
  const points: Vec2[] = [];
  const resolution = 1;

  for (let x = startX; x <= endX; x += resolution) {
    const y = parabola(x);
    points.push([x, y]);
  }

  const mirroredPoints = [...points];
  for (let i = points.length - 1; i >= 0; i--) {
    const [x, y] = points[i];
    const slope = parabolaSlope(x);
    const normalLen = Math.sqrt(1 + slope * slope);
    const nx = -slope / normalLen;
    const ny = 1 / normalLen;
    mirroredPoints.push([
      x + thickness * nx,
      y + thickness * ny
    ]);
  }

  return new CrossSection([mirroredPoints]);
};

// e.g
  // return paroblaCrossSection(m, thickness);
// 
  // const insert = 
    // blue(paroblaCrossSection(m, insertDepth+1).extrude(insertSize)
    // .translate([0, thickness-insertDepth, (width-insertSize)/2]));
// 
  // const shape = 
    // green(paroblaCrossSection(m, thickness).extrude(width))
    // .subtract(insert);
// 
  // return shape;

export const mainAssembly = (m: ManifoldToplevel) => {
  const {CrossSection, Manifold} = m;
  const width = 35;
  const height = 25;
  const insertWallSize = 4;
  const insertDepth = height-insertWallSize;
  
  // arc parameters
  const arcRadius = 10;
  const segments = 16;
  
  const points: Vec2[] = [];
  
  points.push(
    [0, 0],
    [width/2, 0],
  );

  for (let i = 0; i <= segments; i++) {
    const theta = (i/segments) * (Math.PI/2.2);
    points.push([
      width/2 - arcRadius + arcRadius * Math.cos(theta),
      height + arcRadius * Math.sin(theta)
    ]);
  }

  for (let i = segments; i >= 0; i--) {
    const theta = (i/segments) * (Math.PI/2.2);
    points.push([
      width/2 - arcRadius + (arcRadius-insertWallSize) * Math.cos(theta),
      height + (arcRadius-insertWallSize) * Math.sin(theta)
    ]);
  }

  points.push(
    [width/2-insertWallSize, height-insertDepth],
    [0, height-insertDepth]
  );

  const handle = new CrossSection([points]).mirror([1,0])
    .add(new CrossSection([points]))
    .extrude(25)
    .rotate(90, 0, 90)
    .translate(-25/2, 0, 0)

  const cylinder = Manifold.cylinder(4, 40, 40, 512)
    .scale([1, 1, 1])

  return color(handle).add(blue(cylinder));
};
