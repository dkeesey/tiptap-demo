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
  },

  // New additions for enhanced UI experience
  
  // Smooth fade transitions for menus and panels
  fadeTransition: 'transition-opacity duration-200 ease-in-out',
  
  // Gentle slide-in from top
  slideDown: 'transition-transform duration-200 ease-out -translate-y-2 opacity-0 animate-in data-[state=open]:translate-y-0 data-[state=open]:opacity-100',
  
  // Gentle slide-in from bottom
  slideUp: 'transition-transform duration-200 ease-out translate-y-2 opacity-0 animate-in data-[state=open]:translate-y-0 data-[state=open]:opacity-100',
  
  // Soft pop effect for items appearing
  popIn: 'scale-95 opacity-0 animate-in data-[state=open]:scale-100 data-[state=open]:opacity-100 transition-all duration-200 ease-out',
  
  // Improved button press effect
  pressable: 'active:scale-[0.97] active:brightness-95 transition-all duration-150',
  
  // Subtle pulse animation for indicating activity or drawing attention
  pulse: 'animate-pulse duration-2000',
  
  // Smooth scaling effect for cards and panels
  cardHover: 'transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md hover:z-10',
  
  // Gentle border highlight effect
  borderFocus: 'transition-colors duration-300 ease-in-out focus-within:border-blue-400 hover:border-blue-300',
  
  // Smooth color transitions for status indicators
  statusTransition: 'transition-colors duration-500 ease-in-out',
  
  // Subtle glow effect for highlighted elements
  glow: 'transition-all duration-300 ease-out hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
}

// Utility for combining Tailwind classes conditionally
export const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}
