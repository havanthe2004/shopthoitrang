// utils/color.ts

export type ColorMap = Record<string, string>;

const COLOR_MAP: ColorMap = {
  // Basic
  den: "#000000",
  black: "#000000",

  trang: "#FFFFFF",
  white: "#FFFFFF",

  xam: "#6B7280",
  gray: "#6B7280",
  grey: "#6B7280",

  // Red family
  do: "#DC2626",
  red: "#DC2626",
  burgundy: "#800020",
  do_do: "#7F1D1D",

  // Blue family
  xanh: "#2563EB",
  blue: "#2563EB",
  navy: "#1E3A8A",
  xanh_navy: "#1E3A8A",
  denim: "#1560BD",

  // Green family
  xanh_la: "#16A34A",
  green: "#16A34A",
  olive: "#556B2F",
  mint: "#98FF98",
  teal: "#008080",

  // Yellow / Orange
  vang: "#FACC15",
  yellow: "#FACC15",
  cam: "#F97316",
  orange: "#F97316",

  // Purple / Pink
  tim: "#7C3AED",
  purple: "#7C3AED",
  hong: "#EC4899",
  pink: "#EC4899",

  // Brown / Neutral
  nau: "#92400E",
  brown: "#92400E",
  be: "#F5F5DC",
  kem: "#FFFDD0",
  khaki: "#C3B091"
};

export const getColorCode = (colorName?: string): string => {
  if (!colorName) return "#D1D5DB";

  const key = colorName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  return COLOR_MAP[key] || "#D1D5DB";
};