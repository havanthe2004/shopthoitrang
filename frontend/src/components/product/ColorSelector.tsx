import { getColorCode } from "../../utils/color";

interface Color {
  color: string;
  images?: { url: string }[];
}

interface Props {
  colors: Color[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  setMainImage: (url: string) => void;
}

const ColorSelector = ({
  colors,
  selectedColor,
  setSelectedColor,
  setMainImage
}: Props) => {

  const handleSelectColor = (colorObj: Color) => {
    setSelectedColor(colorObj.color);

    if (colorObj.images?.[0]) {
      setMainImage(colorObj.images[0].url);
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

        {colors.map((c) => {
          const isActive = selectedColor === c.color;

          return (
            <button
              key={c.color}
              onClick={() => handleSelectColor(c)}
              className={`
                px-4 py-2 border rounded-md text-sm
                ${isActive
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-gray-300"}
              `}
            >

              <span
                className="w-4 h-4 inline-block rounded-full mr-2"
                style={{ backgroundColor: getColorCode(c.color) }}
              />

              {c.color}
            </button>
          );
        })}

      </div>
    </div>
  );
};

export default ColorSelector;