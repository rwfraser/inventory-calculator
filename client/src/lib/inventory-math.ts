/**
 * Coordinate System Logic
 * 
 * Structure: 
 * Rack (52) - Shelf (20) - Tray (4) - Bin (15) - Item (5)
 * 
 * Hierarchy & Multipliers:
 * Item:   1
 * Bin:    5 items
 * Tray:   15 bins * 5 items = 75 items
 * Shelf:  4 trays * 75 items = 300 items
 * Rack:   20 shelves * 300 items = 6000 items
 * Total:  52 racks * 6000 items = 312,000 items
 */

export const CONFIG = {
  RACKS: 52,    // a-z (1-26), A-Z (27-52)
  SHELVES: 20,  // a-t
  TRAYS: 4,     // 1-4
  BINS: 15,     // a-o
  ITEMS: 5,     // 1-5
  
  // Calculated Multipliers
  M_BIN: 5,
  M_TRAY: 75,   // 15 * 5
  M_SHELF: 300, // 4 * 75
  M_RACK: 6000, // 20 * 300
  TOTAL_CAPACITY: 312000 // 52 * 6000
};

export type Coordinate = {
  rack: number;   // 1-52
  shelf: number;  // 1-20
  tray: number;   // 1-4
  bin: number;    // 1-15
  item: number;   // 1-5
};

// Helper: Get char from rack number (1-52)
// 1-26 -> a-z
// 27-52 -> A-Z
function getRackChar(num: number): string {
  if (num < 1 || num > 52) throw new Error("Invalid rack number");
  if (num <= 26) return String.fromCharCode(num + 96); // a=97
  return String.fromCharCode(num - 26 + 64); // A=65
}

// Helper: Get rack number from char
function getRackNum(char: string): number {
  const code = char.charCodeAt(0);
  if (code >= 97 && code <= 122) return code - 96; // a-z
  if (code >= 65 && code <= 90) return code - 38; // A-Z (A=27)
  throw new Error("Invalid rack character");
}

// Helper: Get char from shelf/bin (1-26) -> a-z
function getChar(num: number): string {
  return String.fromCharCode(num + 96);
}

// Helper: Get num from char (a-z -> 1-26)
function getNum(char: string): number {
  return char.toLowerCase().charCodeAt(0) - 96;
}

export function parseCoordinate(coord: string): Coordinate {
  // Expected format: R S T B I (5 chars)
  // e.g. Ad3n5
  // R: 1 char (a-z, A-Z)
  // S: 1 char (a-t)
  // T: 1 digit (1-4)
  // B: 1 char (a-o)
  // I: 1 digit (1-5)

  if (!coord || coord.length !== 5) {
    throw new Error("Coordinate must be exactly 5 characters (e.g., Ad3n5)");
  }

  const rackChar = coord[0];
  const shelfChar = coord[1];
  const trayChar = coord[2];
  const binChar = coord[3];
  const itemChar = coord[4];

  const rack = getRackNum(rackChar);
  const shelf = getNum(shelfChar);
  const tray = parseInt(trayChar, 10);
  const bin = getNum(binChar);
  const item = parseInt(itemChar, 10);

  // Validation
  if (rack < 1 || rack > CONFIG.RACKS) throw new Error(`Invalid Rack '${rackChar}'. Must be a-z or A-Z.`);
  if (shelf < 1 || shelf > CONFIG.SHELVES) throw new Error(`Invalid Shelf '${shelfChar}'. Must be a-t.`);
  if (isNaN(tray) || tray < 1 || tray > CONFIG.TRAYS) throw new Error(`Invalid Tray '${trayChar}'. Must be 1-4.`);
  if (bin < 1 || bin > CONFIG.BINS) throw new Error(`Invalid Bin '${binChar}'. Must be a-o.`);
  if (isNaN(item) || item < 1 || item > CONFIG.ITEMS) throw new Error(`Invalid Item '${itemChar}'. Must be 1-5.`);

  return { rack, shelf, tray, bin, item };
}

export function formatCoordinate(c: Coordinate): string {
  return `${getRackChar(c.rack)}${getChar(c.shelf)}${c.tray}${getChar(c.bin)}${c.item}`;
}

export function toLinear(c: Coordinate): number {
  // 1-based index calculation
  // (rack-1)*6000 + (shelf-1)*300 + (tray-1)*75 + (bin-1)*5 + (item-1) + 1
  return (
    (c.rack - 1) * CONFIG.M_RACK +
    (c.shelf - 1) * CONFIG.M_SHELF +
    (c.tray - 1) * CONFIG.M_TRAY +
    (c.bin - 1) * CONFIG.M_BIN +
    (c.item) 
  );
}

export function fromLinear(linear: number): Coordinate {
  if (linear < 1 || linear > CONFIG.TOTAL_CAPACITY) {
    throw new Error(`Item number ${linear} is out of bounds (Max ${CONFIG.TOTAL_CAPACITY})`);
  }

  let remainder = linear - 1; // 0-based for modulo math

  const rack = Math.floor(remainder / CONFIG.M_RACK) + 1;
  remainder %= CONFIG.M_RACK;

  const shelf = Math.floor(remainder / CONFIG.M_SHELF) + 1;
  remainder %= CONFIG.M_SHELF;

  const tray = Math.floor(remainder / CONFIG.M_TRAY) + 1;
  remainder %= CONFIG.M_TRAY;

  const bin = Math.floor(remainder / CONFIG.M_BIN) + 1;
  remainder %= CONFIG.M_BIN;

  const item = remainder + 1;

  return { rack, shelf, tray, bin, item };
}

export function validateCoordinateFormat(val: string): boolean {
  try {
    parseCoordinate(val);
    return true;
  } catch (e) {
    return false;
  }
}
