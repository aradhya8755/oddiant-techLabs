// components/ui/slider.tsx
import React from "react"

type SliderProps = {
  min?: number
  max?: number
  step?: number
  value?: number[]
  onChange?: (val: number[]) => void
}

export const Slider = ({
  min = 0,
  max = 100,
  step = 1,
  value = [0],
  onChange,
}: SliderProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = [parseInt(e.target.value)]
    onChange?.(newVal)
  }

  return (
    <div className="w-full">
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
      />
    </div>
  )
}
