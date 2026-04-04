import { getColorCode } from "../../utils/color";

interface Variant {
  color: string;
  images?: { url: string }[];
}

interface Props {
  variants: Variant[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  setMainImage: (url: string) => void;
}

const ColorSelector = ({
  variants,
  selectedColor,
  setSelectedColor,
  setMainImage
}: Props) => {

  const uniqueColors = [...new Map(
    variants.map(v => [v.color, v])
  ).values()];

  const handleSelectColor = (variant: Variant) => {
    setSelectedColor(variant.color);

    if (variant.images?.[0]) {
      setMainImage(variant.images[0].url);
    }
  };

  return (
    <div className="mb-6">

      <h3 className="font-semibold mb-3">
        Màu sắc: 
        <span className="text-red-500 ml-2">
          {selectedColor}
        </span>
      </h3>

      <div className="flex flex-wrap gap-3">

        {uniqueColors.map(v => {
          const isActive = selectedColor === v.color;

          return (
            <button
              key={v.color}
              onClick={() => handleSelectColor(v)}
              className={`
                flex items-center gap-2
                px-4 py-2 border rounded-md
                text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-gray-300 hover:border-black"}
              `}
            >

              {/* Color dot */}
              <span
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{
                  backgroundColor: getColorCode(v.color)
                }}
              />

              {v.color}

            </button>
          );
        })}

      </div>
    </div>
  );
};

export default ColorSelector;