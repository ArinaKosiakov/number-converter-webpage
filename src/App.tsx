import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Heading,
} from '@chakra-ui/react';
import {
  type ConversionState,
  type HexBitWidth,
  convertFromASCII,
  convertFromHex,
  convertFromBase64,
  convertFromDecimal,
  convertFromBinary,
  hexToBytes,
  bytesToHex,
  bytesToAscii,
  bytesToDecimal,
  bytesToBinary,
  bytesToBase64,
  BigEndianToLittleEndian,
  LittleEndianToBigEndian,
} from "./utils/utils";
import { theme } from './utils/theme';
import { Copy, Eraser } from "lucide-react";
import CustomSimpleBox from "./components/CustomSimpleBox";

type ConversionType = 'ascii' | 'hex' | 'base64' | 'decimal' | 'binary';
type Endianness = "big" | "little";

function App() {
  const [state, setState] = useState<ConversionState>({
    ascii: "",
    hex: "",
    base64: "",
    decimal: "",
    binary: "",
    hexPrefix: "0x",
    hexBitWidth: 8,
    endianness: "big",
  });

  const [activeField, setActiveField] = useState<ConversionType | null>(null);
  const [copiedField, setCopiedField] = useState<ConversionType | null>(null);

  const copyToClipboard = useCallback(async (field: ConversionType, text: string) => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
    }
  }, []);

  const handleClearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      ascii: '',
      hex: '',
      base64: '',
      decimal: '',
      binary: '',
    }));
    setActiveField(null);
  }, []);

  const handleInputChange = (field: ConversionType, value: string) => {
    setActiveField(field);
    
    let newState: ConversionState;
    const currentState = { ...state, [field]: value };
    
    switch (field) {
      case 'ascii':
        newState = convertFromASCII(value, currentState.hexPrefix, currentState.hexBitWidth);
        break;
      case 'hex':
        newState = convertFromHex(value, currentState.hexPrefix, currentState.hexBitWidth);
        break;
      case 'base64':
        newState = convertFromBase64(value, currentState.hexPrefix, currentState.hexBitWidth);
        break;
      case 'decimal':
        newState = convertFromDecimal(value, currentState.hexPrefix, currentState.hexBitWidth);
        break;
      case 'binary':
        newState = convertFromBinary(value, currentState.hexPrefix, currentState.hexBitWidth);
        break;
      default:
        return;
    }
    
    setState(newState);
  };

  const handleHexPrefixChange = (prefix: string) => {
    setState(prev => {
      const bytes = hexToBytes(prev.hex, prev.hexPrefix, prev.hexBitWidth);
      const newState = {
        ...prev,
        hexPrefix: prefix,
        hex: bytesToHex(bytes, prefix, prev.hexBitWidth),
      };
      
      if (activeField && activeField !== 'hex') {
        let converted: ConversionState;
        switch (activeField) {
          case 'ascii':
            converted = convertFromASCII(prev.ascii, prefix, prev.hexBitWidth);
            break;
          case 'base64':
            converted = convertFromBase64(prev.base64, prefix, prev.hexBitWidth);
            break;
          case 'decimal':
            converted = convertFromDecimal(prev.decimal, prefix, prev.hexBitWidth);
            break;
          case 'binary':
            converted = convertFromBinary(prev.binary, prefix, prev.hexBitWidth);
            break;
          default:
            return newState;
        }
        return { ...converted, hexPrefix: prefix };
      }
      
      return newState;
    });
  };

  const handleHexBitWidthChange = (bitWidth: HexBitWidth) => {
    setState(prev => {
      const bytes = hexToBytes(prev.hex, prev.hexPrefix, prev.hexBitWidth);
      return {
        ...prev,
        hexBitWidth: bitWidth,
        ascii: bytesToAscii(bytes),
        hex: bytesToHex(bytes, prev.hexPrefix, bitWidth),
        base64: bytesToBase64(bytes),
        decimal: bytesToDecimal(bytes, bitWidth),
        binary: bytesToBinary(bytes, bitWidth),
      };
    });
  };

  const handleEndiannessChange = (endianness: Endianness) => {
    setState((prev) => {
      if (prev.hexBitWidth === 8) {
        if (endianness === "big") return prev;
        const bytes = hexToBytes(prev.hex, prev.hexPrefix, 8);
        const swapped = BigEndianToLittleEndian(bytes);
        return {
          ...prev,
          hexBitWidth: 16,
          endianness: "little",
          ascii: bytesToAscii(swapped),
          hex: bytesToHex(swapped, prev.hexPrefix, 16),
          base64: bytesToBase64(swapped),
          decimal: bytesToDecimal(swapped, 16),
          binary: bytesToBinary(swapped, 16),
        };
      }
      if (prev.endianness === endianness) return prev;
      const bytes = hexToBytes(prev.hex, prev.hexPrefix, prev.hexBitWidth);
      const swapped =
        endianness === "little"
          ? BigEndianToLittleEndian(bytes)
          : LittleEndianToBigEndian(bytes);
      return {
        ...prev,
        endianness,
        ascii: bytesToAscii(swapped),
        hex: bytesToHex(swapped, prev.hexPrefix, prev.hexBitWidth),
        base64: bytesToBase64(swapped),
        decimal: bytesToDecimal(swapped, prev.hexBitWidth),
        binary: bytesToBinary(swapped, prev.hexBitWidth),
      };
    });
  };
  const { cardProps, inputProps, colorProps } = theme;

  
  return (
    <Box minH="100vh" bg={colorProps.backgroundColor} py={8}>
      <Container maxW="4xl">
        <VStack gap={6} align="stretch">
          <Heading
            size="xl"
            color={colorProps.headingColor}
            textAlign="center"
            fontWeight="600"
            letterSpacing="tight"
          >
            Number Converter
          </Heading>
          <Box {...cardProps}>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color={colorProps.textColor}
                >
                  ASCII
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant={
                      state.hexBitWidth === 8 || state.endianness === "big"
                        ? "solid"
                        : "outline"
                    }
                    onClick={() => handleEndiannessChange("big")}
                    bg={
                      state.hexBitWidth === 8 || state.endianness === "big"
                        ? colorProps.button.onSelectedBackgroundColor
                        : colorProps.button.backgroundColor
                    }
                    borderColor={colorProps.button.borderColor}
                    color={
                      state.hexBitWidth === 8 || state.endianness === "big"
                        ? colorProps.button.onSelectedTextColor
                        : colorProps.button.textColor
                    }
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    Big Endian
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      state.endianness === "little" ? "solid" : "outline"
                    }
                    onClick={() => handleEndiannessChange("little")}
                    bg={
                      state.endianness === "little"
                        ? colorProps.button.onSelectedBackgroundColor
                        : colorProps.button.backgroundColor
                    }
                    borderColor={colorProps.button.borderColor}
                    color={
                      state.endianness === "little"
                        ? colorProps.button.onSelectedTextColor
                        : colorProps.button.textColor
                    }
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    Little Endian
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAll}
                    borderColor={colorProps.button.borderColor}
                    color={colorProps.textColor}
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    <HStack gap={1.5}>
                      <Eraser />
                      <span>Clear</span>
                    </HStack>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("ascii", state.ascii)}
                    disabled={!state.ascii.trim()}
                    borderColor={colorProps.button.borderColor}
                    color={colorProps.textColor}
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    <HStack gap={1.5}>
                      <Copy />
                      <span color={colorProps.textColor}>
                        {copiedField === "ascii" ? "Copied!" : "Copy"}
                      </span>
                    </HStack>
                  </Button>
                </HStack>
              </HStack>
              <Textarea
                value={state.ascii}
                onChange={(e) => handleInputChange("ascii", e.target.value)}
                placeholder="Enter ASCII text"
                {...inputProps}
              />
            </VStack>
          </Box>

          <Box {...cardProps}>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color={colorProps.textColor}
                >
                  Hex
                </Text>
                <HStack gap={2} flexWrap="wrap">
                  <Button
                    size="sm"
                    variant={state.hexPrefix === "0x" ? "solid" : "outline"}
                    onClick={() => handleHexPrefixChange("0x")}
                    bg={
                      state.hexPrefix === "0x"
                        ? colorProps.button.onSelectedBackgroundColor
                        : colorProps.button.backgroundColor
                    }
                    borderColor={colorProps.button.borderColor}
                    color={
                      state.hexPrefix === "0x"
                        ? colorProps.button.onSelectedTextColor
                        : colorProps.button.textColor
                    }
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    0x
                  </Button>
                  <Button
                    size="sm"
                    variant={state.hexPrefix === "" ? "solid" : "outline"}
                    onClick={() => handleHexPrefixChange("")}
                    bg={
                      state.hexPrefix === ""
                        ? colorProps.button.onSelectedBackgroundColor
                        : colorProps.button.backgroundColor
                    }
                    borderColor={colorProps.button.borderColor}
                    color={
                      state.hexPrefix === ""
                        ? colorProps.button.onSelectedTextColor
                        : colorProps.button.textColor
                    }
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    No prefix
                  </Button>
                  <Button
                    size="sm"
                    variant={state.hexBitWidth === 8 ? "solid" : "outline"}
                    onClick={() => handleHexBitWidthChange(8)}
                    bg={
                      state.hexBitWidth === 8
                        ? colorProps.button.onSelectedBackgroundColor
                        : colorProps.button.backgroundColor
                    }
                    borderColor={colorProps.button.borderColor}
                    color={
                      state.hexBitWidth === 8
                        ? colorProps.button.onSelectedTextColor
                        : colorProps.button.textColor
                    }
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    8 bit
                  </Button>
                  <Button
                    size="sm"
                    variant={state.hexBitWidth === 16 ? "solid" : "outline"}
                    onClick={() => handleHexBitWidthChange(16)}
                    bg={
                      state.hexBitWidth === 16
                        ? colorProps.button.onSelectedBackgroundColor
                        : colorProps.button.backgroundColor
                    }
                    borderColor={colorProps.button.borderColor}
                    color={
                      state.hexBitWidth === 16
                        ? colorProps.button.onSelectedTextColor
                        : colorProps.button.textColor
                    }
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    16 bit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("hex", state.hex)}
                    disabled={!state.hex.trim()}
                    bg="transparent"
                    borderColor={colorProps.button.borderColor}
                    color={colorProps.button.textColor}
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    <HStack gap={1.5}>
                      <Copy />
                      <span>{copiedField === "hex" ? "Copied!" : "Copy"}</span>
                    </HStack>
                  </Button>
                </HStack>
              </HStack>
              <Textarea
                value={state.hex}
                onChange={(e) => handleInputChange("hex", e.target.value)}
                placeholder="Enter hex values"
                {...inputProps}
              />
            </VStack>
          </Box>

          <Box {...cardProps}>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <Text fontSize="sm" fontWeight="500" color="#a1a1aa">
                  Base64
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("base64", state.base64)}
                    disabled={!state.base64.trim()}
                    bg={colorProps.button.backgroundColor}
                    borderColor={colorProps.button.borderColor}
                    color={colorProps.button.textColor}
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    <HStack gap={1.5}>
                      <Copy />
                      <span>
                        {copiedField === "base64" ? "Copied!" : "Copy"}
                      </span>
                    </HStack>
                  </Button>
                </HStack>
              </HStack>
              <Textarea
                value={state.base64}
                onChange={(e) => handleInputChange("base64", e.target.value)}
                placeholder="Enter base64 encoded values"
                {...inputProps}
              />
            </VStack>
          </Box>

          <Box {...cardProps}>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color={colorProps.textColor}
                >
                  Decimal
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("decimal", state.decimal)}
                    disabled={!state.decimal.trim()}
                    bg={colorProps.button.backgroundColor}
                    borderColor={colorProps.button.borderColor}
                    color={colorProps.button.textColor}
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    <HStack gap={1.5}>
                      <Copy />
                      <span>
                        {copiedField === "decimal" ? "Copied!" : "Copy"}
                      </span>
                    </HStack>
                  </Button>
                </HStack>
              </HStack>
              <Textarea
                value={state.decimal}
                onChange={(e) => handleInputChange("decimal", e.target.value)}
                placeholder="Enter decimal values"
                {...inputProps}
              />
            </VStack>
          </Box>

          <Box {...cardProps}>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color={colorProps.textColor}
                >
                  Binary
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard("binary", state.binary)}
                    disabled={!state.binary.trim()}
                    bg={colorProps.button.backgroundColor}
                    borderColor={colorProps.button.borderColor}
                    color={colorProps.button.textColor}
                    _hover={{
                      bg: colorProps.button.onHoverBackgroundColor,
                      borderColor: colorProps.button.onHoverBorderColor,
                      color: colorProps.button.onHoverTextColor,
                    }}
                  >
                    <HStack gap={1.5}>
                      <Copy />
                      <span>
                        {copiedField === "binary" ? "Copied!" : "Copy"}
                      </span>
                    </HStack>
                  </Button>
                </HStack>
              </HStack>
              <Textarea
                value={state.binary}
                onChange={(e) => handleInputChange("binary", e.target.value)}
                placeholder="Enter binary values"
                {...inputProps}
              />
              {state.binary.trim() ? (
                <CustomSimpleBox>
                  {state.binary
                    .trim()
                    .replace(/\s+/g, "")
                    .match(/.{1,8}/g)
                    ?.map((byte, i) => (
                      <Box
                        key={`${i}-${byte}`}
                        as="span"
                        color={
                          i % 2 === 0
                            ? colorProps.secondaryTextColor
                            : colorProps.textColor
                        }
                        mr={1}
                      >
                        {byte}
                      </Box>
                    )) ?? null}
                </CustomSimpleBox>
              ) : null}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;