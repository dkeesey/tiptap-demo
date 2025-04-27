// Utility for adding subtle micro-interactions to UI components
export const microInteractions = {
  // Hover and focus states
  button: 'transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
  
  // Subtle grow on hover
  hover: 'transition-transform duration-300 ease-out hover:scale-[1.01]',
  
  // Smooth appearance animations
  appear: 'animate-fade-in opacity-0 animate-duration-300 animate-ease-out',
  
  // Subtle shadow changes
  shadow: 'transition-shadow duration-300 ease-in-out hover:shadow-md',
  
  // Soft background transitions
  background: 'transition-colors duration-200 ease-in-out hover:bg-opacity-90 active:bg-opacity-80',
  
  // Interactive elements
  interactive: 'cursor-pointer select-none active:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
  
  // Tooltip-like hover effects
  tooltip: {
    trigger: 'relative group',
    content: 'absolute z-10 p-2 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-full top-0 left-1/2 -translate-x-1/2'
  }
}

// Utility for combining Tailwind classes conditionally
export const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}
