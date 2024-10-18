'use client';
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useChat } from "@/providers/chat-provider";

const ChatParams = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { parameters, setParameters } = useChat();

  const handleSliderChange = (name: string, value: number[]) => {
    setParameters({ [name]: value[0] });
  };

  const handleSelectChange = (value: string) => {
    setParameters({ model: value });
  };

  return (
    <div className="text-white p-4 rounded-lg w-full">
      <div className="flex gap-4 items-center mb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="text-xs font-normal"> Parameters</h2 >
        <div className="p-1.5 bg-bg rounded-xl flex justify-center items-center group">
          {isExpanded ? <FaChevronUp size={15} className="group-hover:text-primary" /> : <FaChevronDown size={15} className="group-hover:text-primary" />}
        </div>
      </div >

      {isExpanded && (
        <>
          <div className="space-y-4">
            <div>
              <div className="flex gap-2 items-center">
                <label className="block font-normal text-sm text-text-gray mb-1">Output Length</label>
                <span className="text-xs bg-bg px-2 rounded-xl">{parameters.output_length}</span>
              </div>
              <Slider
                value={[parameters.output_length]}
                onValueChange={(value) => handleSliderChange('output_length', value)}
                max={1024}
                step={1}
              />
            </div>

            <div>
              <div className="flex gap-2 items-center">
                <label className="block font-normal text-sm text-text-gray mb-1">Temperature</label>
                <span className="text-xs bg-bg px-2 rounded-xl">{parameters.temperature.toFixed(1)}</span>
              </div>
              <Slider
                value={[parameters.temperature]}
                onValueChange={(value) => handleSliderChange('temperature', value)}
                max={1}
                step={0.1}
              />
            </div>

            <div>
              <div className="flex gap-2 items-center">
                <label className="block font-normal text-sm text-text-gray mb-1">Top P</label>
                <span className="text-xs bg-bg px-2 rounded-xl">{parameters.top_p.toFixed(1)}</span>
              </div>
              <Slider
                value={[parameters.top_p]}
                onValueChange={(value) => handleSliderChange('top_p', value)}
                max={1}
                step={0.1}
              />
            </div>

            <div>
              <div className="flex gap-2 items-center">
                <label className="block font-normal text-sm text-text-gray mb-1">Repetition Penalty</label>
                <span className="text-xs bg-bg px-2 rounded-xl">{parameters.repetition_penalty.toFixed(2)}</span>
              </div>
              <Slider
                value={[parameters.repetition_penalty]}
                onValueChange={(value) => handleSliderChange('repetition_penalty', value)}
                min={1}
                max={2}
                step={0.01}
              />
            </div>
          </div>
        </>
      )}
      <div className="mt-4">
        <h2 className="text-xs font-normal mb-2">Model</h2>
        <Select
          value={parameters.model}
          onChange={handleSelectChange}
          options={[
            { value: 'typhoon-instruct', label: 'typhoon-instruct' },
            { value: 'typhoon-v1.5-instruct', label: 'typhoon-v1.5-instruct' },
            { value: 'typhoon-v1.5x-70b-instruct', label: 'typhoon-v1.5x-70b-instruct' },
          ]}
        />
      </div>
    </div >
  );
};

export default ChatParams;
