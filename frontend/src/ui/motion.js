import { useReducedMotion } from 'framer-motion'

export const motionDurations = {
  micro: 0.12,
  short: 0.18,
  base: 0.24,
  long: 0.32,
}

export const motionEase = {
  out: [0.2, 0, 0, 1],
  in: [0.4, 0, 1, 1],
}

export function useMotionConfig() {
  const reduced = useReducedMotion()
  return {
    reduced,
    duration(multiplier = 1) {
      if (reduced) return 0
      return motionDurations.base * multiplier
    },
  }
}

