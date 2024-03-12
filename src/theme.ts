import { createTheme } from "@mantine/core";

export const theme = createTheme({
  colors: {
    purple: [
      "#ffebff",
      "#f5d5fc",
      "#e6a9f3",
      "#d779eb",
      "#cb51e4",
      "#c437e0",
      "#c029df",
      "#a91cc6",
      "#9715b1",
      "#840a9c"
    ]
  },
  activeClassName:
    "transition-[transform_50ms_ease-in-out] active:scale-[0.97]",
  focusRing: "never",
  primaryColor: "purple",
  fontFamily: "Inter"
});
