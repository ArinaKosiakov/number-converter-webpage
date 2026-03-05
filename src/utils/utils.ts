// Types used by conversion functions
export type HexBitWidth = 8 | 16;
export type Endianness = "big" | "little";
export interface ConversionState {
  ascii: string;
  hex: string;
  base64: string;
  decimal: string;
  binary: string;
  hexPrefix: string;
  hexBitWidth: HexBitWidth;
  endianness: Endianness;
}

// ASCII <-> bytes
export function asciiToBytes(text: string): number[] {
  return Array.from(text).map((char) => char.charCodeAt(0));
}

export function bytesToAscii(bytes: number[]): string {
  return bytes.map((byte) => String.fromCharCode(byte)).join('');
}

// Bytes <-> Hex
export function bytesToHex(
  bytes: number[],
  prefix: string,
  bitWidth: HexBitWidth,
): string {
  if (bitWidth === 16) {
    const result: string[] = [];
    for (let i = 0; i < bytes.length; i += 2) {
      const high = bytes[i];
      const low = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const value = (high << 8) | low;
      result.push(`${prefix}${value.toString(16).padStart(4, "0")}`);
    }
    return result.join(" ");
  }
  // At 8 bit: skip 0x00 bytes (do not display them)
  return bytes
    .filter((byte) => byte !== 0)
    .map((byte) => `${prefix}${byte.toString(16).padStart(2, "0")}`)
    .join(" ");
}

export function hexToBytes(hex: string, prefix: string, bitWidth: HexBitWidth): number[] {
  const cleaned = hex
    .replace(new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
    .replace(/\s+/g, '');
  const bytes: number[] = [];
  const chunkSize = bitWidth === 16 ? 4 : 2;
  for (let i = 0; i < cleaned.length; i += chunkSize) {
    const chunk = cleaned.substr(i, chunkSize);
    if (chunk.length === chunkSize) {
      const value = parseInt(chunk, 16);
      if (!isNaN(value)) {
        if (bitWidth === 16) {
          bytes.push((value >> 8) & 0xff, value & 0xff);
        } else {
          const byte = value & 0xff;
          // At 8 bit: ignore 0x00 (do not add to bytes)
          if (byte !== 0) bytes.push(byte);
        }
      }
    }
  }
  return bytes;
}

// Bytes <-> Base64
export function bytesToBase64(bytes: number[]): string {
  const binary = bytes.map((byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

export function base64ToBytes(base64: string): number[] {
  try {
    const binary = atob(base64);
    return Array.from(binary).map((char) => char.charCodeAt(0));
  } catch {
    return [];
  }
}

// Bytes <-> Decimal
export function bytesToDecimal(bytes: number[], bitWidth: HexBitWidth): string {
  if (bitWidth === 16) {
    const result: string[] = [];
    for (let i = 0; i < bytes.length; i += 2) {
      const high = bytes[i];
      const low = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const value = (high << 8) | low;
      result.push(value.toString(10));
    }
    return result.join(" ");
  }
  // At 8 bit: skip 0 (do not display them)
  return bytes
    .filter((byte) => byte !== 0)
    .map((byte) => byte.toString(10).padStart(3, "0"))
    .join(" ");
}

export function decimalToBytes(
  decimal: string,
  bitWidth: HexBitWidth,
): number[] {
  const numbers = decimal
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0);
  if (bitWidth === 16) {
    return numbers.flatMap((n) => {
      const num = parseInt(n, 10);
      const value = isNaN(num) ? 0 : Math.max(0, Math.min(65535, num));
      return [(value >> 8) & 0xff, value & 0xff];
    });
  }
  // At 8 bit: ignore 0 (do not add to bytes)
  return numbers
    .map((n) => {
      const num = parseInt(n, 10);
      return isNaN(num) ? 0 : Math.max(0, Math.min(255, num));
    })
    .filter((byte) => byte !== 0);
}

// Bytes <-> Binary
export function bytesToBinary(bytes: number[], bitWidth: HexBitWidth): string {
  if (bitWidth === 16) {
    const result: string[] = [];
    for (let i = 0; i < bytes.length; i += 2) {
      const high = bytes[i];
      const low = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const value = (high << 8) | low;
      result.push(value.toString(2).padStart(16, "0"));
    }
    return result.join(" ");
  }
  // At 8 bit: skip 00000000 (do not display them)
  return bytes
    .filter((byte) => byte !== 0)
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(" ");
}

export function binaryToBytes(binary: string, bitWidth: HexBitWidth): number[] {
  const numbers = binary
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0);
  if (bitWidth === 16) {
    return numbers.flatMap((n) => {
      const num = parseInt(n, 2);
      const value = isNaN(num) ? 0 : Math.max(0, Math.min(65535, num));
      return [(value >> 8) & 0xff, value & 0xff];
    });
  }
  // At 8 bit: ignore 00000000 (do not add to bytes)
  return numbers
    .map((n) => {
      const num = parseInt(n, 2);
      return isNaN(num) ? 0 : Math.max(0, Math.min(255, num));
    })
    .filter((byte) => byte !== 0);
}

// High-level converters: from one format to full ConversionState
export function convertFromASCII(
  ascii: string,
  hexPrefix: string,
  hexBitWidth: HexBitWidth
): ConversionState {
  const text = ascii.replace(/\s/g, '');
  const bytes = asciiToBytes(text);
  return {
    ascii,
    hex: bytesToHex(bytes, hexPrefix, hexBitWidth),
    base64: bytesToBase64(bytes),
    decimal: bytesToDecimal(bytes, hexBitWidth),
    binary: bytesToBinary(bytes, hexBitWidth),
    hexPrefix,
    hexBitWidth,
    endianness: "big",
  };
}

export function convertFromHex(
  hex: string,
  hexPrefix: string,
  hexBitWidth: HexBitWidth
): ConversionState {
  const bytes = hexToBytes(hex, hexPrefix, hexBitWidth);
  const ascii = bytesToAscii(bytes);
  return {
    ascii,
    hex,
    base64: bytesToBase64(bytes),
    decimal: bytesToDecimal(bytes, hexBitWidth),
    binary: bytesToBinary(bytes, hexBitWidth),
    hexPrefix,
    hexBitWidth,
    endianness: "big",
  };
}

export function convertFromBase64(
  base64: string,
  hexPrefix: string,
  hexBitWidth: HexBitWidth
): ConversionState {
  const bytes = base64ToBytes(base64);
  const ascii = bytesToAscii(bytes);
  return {
    ascii,
    hex: bytesToHex(bytes, hexPrefix, hexBitWidth),
    base64,
    decimal: bytesToDecimal(bytes, hexBitWidth),
    binary: bytesToBinary(bytes, hexBitWidth),
    hexPrefix,
    hexBitWidth,
    endianness: "big",
  };
}

export function convertFromDecimal(
  decimal: string,
  hexPrefix: string,
  hexBitWidth: HexBitWidth
): ConversionState {
  const bytes = decimalToBytes(decimal, hexBitWidth);
  const ascii = bytesToAscii(bytes);
  return {
    ascii,
    hex: bytesToHex(bytes, hexPrefix, hexBitWidth),
    base64: bytesToBase64(bytes),
    decimal,
    binary: bytesToBinary(bytes, hexBitWidth),
    hexPrefix,
    hexBitWidth,
    endianness: "big",
  };
}

export function convertFromBinary(
  binary: string,
  hexPrefix: string,
  hexBitWidth: HexBitWidth
): ConversionState {
  const bytes = binaryToBytes(binary, hexBitWidth);
  const ascii = bytesToAscii(bytes);
  return {
    ascii,
    hex: bytesToHex(bytes, hexPrefix, hexBitWidth),
    base64: bytesToBase64(bytes),
    decimal: bytesToDecimal(bytes, hexBitWidth),
    binary,
    hexPrefix,
    hexBitWidth,
    endianness: "big",
  };
}

/** Swaps bytes within each 16-bit word (pair). Converts between big and little endian. */
function swapBytesInPairs(bytes: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < bytes.length; i += 2) {
    if (i + 1 < bytes.length) {
      result.push(bytes[i + 1], bytes[i]);
    } else {
      result.push(bytes[i]);
    }
  }
  return result;
}

/** Converts byte array from big-endian to little-endian (swap bytes in each 16-bit word). */
export function BigEndianToLittleEndian(bytes: number[]): number[] {
  return swapBytesInPairs(bytes);
}

/** Converts byte array from little-endian to big-endian (swap bytes in each 16-bit word). */
export function LittleEndianToBigEndian(bytes: number[]): number[] {
  return swapBytesInPairs(bytes);
}
