// Custom line icons for the neural HUD: one geometric style (24px grid, square caps), coloured by currentColor.
import type { SVGProps } from "react";

const PATHS = {
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" />,
  arrowLeft: <path d="M20 12H5M11 6l-6 6 6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  power: (
    <>
      <path d="M12 3v8" />
      <path d="M6.6 6.6a7.5 7.5 0 1 0 10.8 0" />
    </>
  ),
  // Padlock whose keyhole is a neuron
  lock: (
    <>
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <path d="M5 10h14v11H5z" />
      <circle cx="12" cy="15.5" r="1.6" />
    </>
  ),
  // Diamond node waiting to fire
  node: (
    <>
      <path d="M12 3l8 9-8 9-8-9z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  // A fired neuron: soma with dendrites
  synapse: (
    <>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.35" />
      <path d="M12 9V3M14.6 13.5l5.2 3M9.4 13.5l-5.2 3M14.2 10l4.3-3.5M9.8 10L5.5 6.5" />
    </>
  ),
  // Burst: an action potential / unlock
  spark: <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19" />,
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="18" r="0.6" fill="currentColor" />
    </>
  ),
  // Re-route: a signal loop for catching up
  loop: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 3v4.5h-4.5" />
    </>
  ),
  // EEG-like trace for a thinking pattern
  pattern: <path d="M2 12h4l2-6 4 12 3-8 2 2h5" />,
  // Microchip for a thinking tool/concept
  chip: (
    <>
      <path d="M7 7h10v10H7z" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  // Stored memory: stacked data layers
  memory: <path d="M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4" />,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  implant: <path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" />,
  implantOn: (
    <>
      <path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" />
      <path d="M12 7.5l3.9 2.25v4.5L12 16.5l-3.9-2.25v-4.5z" fill="currentColor" />
    </>
  ),
  transmission: (
    <>
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <path d="M8 8a5.6 5.6 0 0 0 0 8M16 8a5.6 5.6 0 0 1 0 8M5 5a9.9 9.9 0 0 0 0 14M19 5a9.9 9.9 0 0 1 0 14" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 14, className = "", ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
