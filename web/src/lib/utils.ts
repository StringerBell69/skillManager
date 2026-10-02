import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the custom theme names from index.css. Without this, tailwind-merge
// reads `text-13` as a text color and drops it next to a real color class.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["13"],
      shadow: ["float", "card"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
