import { Manifold, CrossSection } from '../manifold_lib/built/manifold';
import { GLTFNode } from '../manifold_lib/worker';
import { color } from './colorgradient';

export const createNode = (shape: Manifold | CrossSection): GLTFNode => {
  const node = new GLTFNode();

  if ('extrude' in shape) {
    node.manifold = color(shape.extrude(0.1));
  } else {
    node.manifold = shape;
  }

  node.material = {
    baseColorFactor: [1, 1, 1],
    metallic: 0.5,
    roughness: 0.5,
    attributes: ['COLOR_0']
  };
  return node;
};
