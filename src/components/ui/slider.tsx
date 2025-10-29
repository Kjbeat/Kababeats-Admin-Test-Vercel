import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EnhancedSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  thumbClassName?: string
  showValueTooltip?: boolean
  compact?: boolean
  preventOverlap?: boolean
  formatValue?: (v: number) => string
  orientation?: 'horizontal' | 'vertical'
  trackClassName?: string
  rangeClassName?: string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  EnhancedSliderProps
>(({ className, thumbClassName, value, defaultValue, showValueTooltip, compact, preventOverlap = true, formatValue, orientation = 'horizontal', trackClassName, rangeClassName, ...props }, ref) => {
  const count = React.useMemo(() => {
    if (Array.isArray(value)) return value.length
    if (Array.isArray(defaultValue)) return defaultValue.length
    return 1
  }, [value, defaultValue])

  const currentValues: number[] = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? (defaultValue as number[])
      : typeof value === 'number'
        ? [value]
        : typeof defaultValue === 'number'
          ? [defaultValue]
          : []

  // Prevent thumbs from crossing by clamping outgoing changes
  const handleValueCommit = (vals: number[]) => {
    if (!preventOverlap || vals.length < 2) return vals
    const [min, max] = vals
    if (min > max) return [max, min]
    return vals
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex touch-none select-none",
        orientation === 'vertical' ? 'h-full flex-col w-fit items-center justify-center' : 'w-full items-center',
        className
      )}
  orientation={orientation as SliderPrimitive.SliderProps['orientation']}
      {...(value !== undefined ? { value } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...props}
    >
      <SliderPrimitive.Track className={cn(
        "relative overflow-hidden rounded-full bg-secondary",
        orientation === 'vertical' ? 'w-1.5 h-24 my-2' : 'h-2 w-full grow',
        trackClassName
      )}>
        <SliderPrimitive.Range className={cn(
          'absolute bg-primary',
          orientation === 'vertical' ? 'w-full' : 'h-full',
          rangeClassName
        )} />
      </SliderPrimitive.Track>
      {Array.from({ length: count }).map((_, i) => {
        const val = currentValues[i]
        const baseThumb = (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(
              compact ? "h-4 w-4" : "h-5 w-5",
              "rounded-full border-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              i === 0 ? "border-primary bg-background" : "border-primary/70 bg-background",
              thumbClassName
            )}
          />
        )
        if (!showValueTooltip) return baseThumb
        return (
          <TooltipProvider key={i} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                {baseThumb}
              </TooltipTrigger>
              <TooltipContent side="top" className="px-2 py-0.5 text-xs">
                {formatValue ? formatValue(val) : val}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
