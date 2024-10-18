import React from 'react';
import { Select as ChakraSelect } from '@chakra-ui/react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options }) => {
  return (
    <ChakraSelect
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="!bg-bg !text-text hover:!border-gray-10 !rounded-xl"
      border="none"
      _focus={{ outline: 'none', boxShadow: 'outline' }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </ChakraSelect>
  );
};
