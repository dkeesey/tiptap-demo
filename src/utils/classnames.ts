// Utility for combining Tailwind classes conditionally
export const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}