import { Box } from '@chakra-ui/react'
import { theme } from '../utils/theme'
import React from 'react'

function CustomSimpleBox({children}:{children: React.ReactNode}) {
    const { inputProps } = theme;
  return (
    <Box    fontFamily="mono"
    fontSize="md"
    py={3}
    px={4}
    borderRadius="md"
    bg={inputProps.bg}
    borderWidth="1px"
    borderColor="transparent"
    minH="80px"
    whiteSpace="pre-wrap"
    wordBreak="break-all"
    lineHeight="tall"> { children}</Box>
  )
}

export default CustomSimpleBox