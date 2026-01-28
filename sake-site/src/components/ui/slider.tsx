import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type SliderVariant = "ember" | "gold";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    variant?: SliderVariant;
  }
>(({ className, variant = "ember", ...props }, ref) => {
  const rangeClass =
    variant === "gold"
      ? "bg-[linear-gradient(90deg,#6f4a1e_0%,#b88634_35%,#f2d68a_70%,#c9a24d_100%)] shadow-[0_0_18px_rgba(214,178,94,0.45)]"
      : "bg-ember";
  const thumbClass =
    variant === "gold"
      ? "border-transparent bg-[radial-gradient(circle_at_30%_30%,#fff2c2_0%,#f1d07a_35%,#c38a3c_60%,#6f4a1e_100%)] shadow-[0_0_18px_rgba(214,178,94,0.7),0_0_40px_rgba(214,178,94,0.35)] focus-visible:ring-[#d6b25e]/60"
      : "border-ember/60 shadow-[0_0_16px_rgba(230,57,70,0.6)] focus-visible:ring-ember/50";

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-border-subtle">
        <SliderPrimitive.Range className={cn("absolute h-full", rangeClass)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-5 w-5 rounded-full border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2",
          thumbClass
        )}
      />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = "Slider";

export { Slider };
