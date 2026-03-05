export const theme = {
  cardProps: {
    bg: "#18181b",
    p: 6,
    borderRadius: "xl",
    borderWidth: "1px",
    borderColor: "#3f3f46",
    _hover: { borderColor: "#52525b" },
  },

  inputProps: {
    fontFamily: "mono",
    bg: "#27272a",
    borderColor: "#3f3f46",
    color: "#fafafa",
    _focus: { borderColor: "#0ea5e9", boxShadow: "0 0 0 1px #0ea5e9" },
    _placeholder: { color: "#71717a" },
  },

  colorProps: {
    backgroundColor: "#0f0f12",
    textColor: "#a1a1aa",
    secondaryTextColor: "#e4e4e7",
    headingColor: "#fafafa",
    button: {
      backgroundColor: "transparent",
      borderColor: "#3f3f46",
      textColor: "#a1a1aa",
      onHoverBackgroundColor: "#27272a",
      onHoverBorderColor: "#0ea5e9",
      onHoverTextColor: "#0ea5e9",
      onSelectedBackgroundColor: "#0ea5e9",
      onSelectedBorderColor: "",
      onSelectedTextColor: "#0f0f12",
    },
  },
};