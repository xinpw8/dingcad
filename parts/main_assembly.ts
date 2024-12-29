import { ManifoldToplevel, Vec3, Vec2, Manifold } from '../manifold_lib/built/manifold';
import { color, green, blue } from './colorgradient';
export const makeCustomShape = (m: ManifoldToplevel, {
  radius = 4,
  totalLength = 30
} = {}) => {
  const { CrossSection } = m;

  // calculate straight section length from total length
  const l = (totalLength/2) - (Math.PI * radius);

  // create base points for left semicircle
  const leftPoints: [number, number][] = [];
  const numSegments = 32; // adjust for smoothness
  for (let i = 0; i <= numSegments/2; i++) {
    const angle = Math.PI * i / (numSegments/2);
    leftPoints.push([
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    ]);
  }

  // create points for right semicircle by translating left points
  const rightPoints: [number, number][] = leftPoints.map(([x, y]) => [x + l, y]);

  // create connecting lines
  const topLine: [number, number][] = [[0, radius], [l, radius]];
  const bottomLine: [number, number][] = [[0, -radius], [l, -radius]];

  // combine all points into one continuous path
  const points: [number, number][] = [
    ...leftPoints,
    ...rightPoints.reverse(),
    ...bottomLine,
    [0, -radius] // close the shape
  ];

  return new CrossSection([points]);
}

export const mainAssembly = (m: ManifoldToplevel) => {
  const { Manifold } = m;
  return makeCustomShape(m);
};
