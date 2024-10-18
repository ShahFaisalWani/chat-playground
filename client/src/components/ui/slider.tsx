import React from 'react';
import { Slider as ChakraSlider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({ value, onValueChange, min = 0, max = 100, step = 1 }) => {
  const handleChange = (val: number) => {
    onValueChange([val]);
  };

  return (
    <ChakraSlider
      value={value[0]}
      min={min}
      max={max}
      step={step}
      onChange={handleChange}
      focusThumbOnChange={false}
    >
      <SliderTrack className="!bg-gray-10">
        <SliderFilledTrack className="!bg-primary" />
      </SliderTrack>
      <SliderThumb border="2px solid" className="!w-[1.15rem] !h-[1.15rem] !bg-text !border-primary !-ml-2" />
    </ChakraSlider>
  );
};
