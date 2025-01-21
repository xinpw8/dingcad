import { ManifoldToplevel, Vec2, Manifold } from '../manifold_lib/built/manifold';
import { color, blue } from './colorgradient';

const createTableTop = (m: ManifoldToplevel, width: number, depth: number, thickness: number) => {
    return m.Manifold.cube([width, depth, thickness]);
}

const createLeg = (m: ManifoldToplevel, height: number, width: number, taper: number) => {
    const topWidth = width;
    const bottomWidth = width - taper;
    return m.Manifold.cylinder(height, topWidth/2, bottomWidth/2, 4);
}

export const mainAssembly = (m: ManifoldToplevel) => {
    // Table dimensions
    const TABLE_WIDTH = 120;
    const TABLE_DEPTH = 80;
    const TABLE_HEIGHT = 75;
    const TOP_THICKNESS = 4;  // Made slightly thicker
    const LEG_WIDTH = 8;
    const LEG_TAPER = 2;
    
    // Create table top - centered in all dimensions
    const top = createTableTop(m, TABLE_WIDTH, TABLE_DEPTH, TOP_THICKNESS)
                .translate([
                    -TABLE_WIDTH/2,  // Center horizontally
                    -TABLE_DEPTH/2,  // Center vertically
                    TABLE_HEIGHT - TOP_THICKNESS/2  // Position at correct height
                ]);
    
    // Create legs - now starting from 0 and going up to meet the table
    const leg = createLeg(m, TABLE_HEIGHT, LEG_WIDTH, LEG_TAPER);
    
    // Inset legs slightly from edges
    const INSET = 10;
    const leg1 = leg.translate([TABLE_WIDTH/2 - INSET, TABLE_DEPTH/2 - INSET, 0]);
    const leg2 = leg.translate([-(TABLE_WIDTH/2 - INSET), TABLE_DEPTH/2 - INSET, 0]);
    const leg3 = leg.translate([-(TABLE_WIDTH/2 - INSET), -(TABLE_DEPTH/2 - INSET), 0]);
    const leg4 = leg.translate([TABLE_WIDTH/2 - INSET, -(TABLE_DEPTH/2 - INSET), 0]);
    
    // Combine all parts
    const table = m.Manifold.union([
        top,
        leg1,
        leg2,
        leg3,
        leg4
    ]);
    
    return blue(table);
};
