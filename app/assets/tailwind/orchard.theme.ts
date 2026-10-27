/**
 * Orchard Tailwind theme extension (web: Nuxt 4).
 * Ported from tailwind.orchard.js (orchard-tokens.json — do not hand-edit; regenerate).
 * Extends the gaps the source file itself calls out: spacing['0'], borderRadius.none,
 * transitionDuration, and the 'emphasized' easing curve.
 */
export default {
  colors: {
    ink: '#0E1C2B',
    green: { '50': '#F5FCF5', '100': '#E8F7E7', '200': '#CFEECB', '300': '#AEE3A8', '400': '#86D57C', '500': '#5EC751', '600': '#4FAA45', '700': '#3F8D38', '800': '#2F6E2B', '900': '#20531F', '950': '#153E16' },
    orange: { '50': '#FFF8F4', '100': '#FEEFE5', '200': '#FDDDC7', '300': '#FCC6A2', '400': '#FAAA74', '500': '#F98D45', '600': '#D7783A', '700': '#B5642F', '800': '#924E23', '900': '#723B19', '950': '#592C11' },
    slate: { '0': '#FFFFFF', '50': '#F5F7F9', '100': '#EAEEF2', '200': '#D7DEE5', '300': '#B7C2CD', '400': '#8A97A5', '500': '#5F6D7C', '600': '#44515F', '700': '#2E3A47', '800': '#1B2836', '900': '#0E1C2B', '950': '#081119' },
    success: { '50': '#F3FAF5', '100': '#E4F3E8', '200': '#C5E4CE', '300': '#9ED2AC', '400': '#6EBC83', '500': '#3DA65A', '600': '#34904E', '700': '#2B7942', '800': '#216235', '900': '#184D29', '950': '#123D20' },
    warning: { '50': '#FEFBF4', '100': '#FDF5E4', '200': '#FCE9C6', '300': '#FADBA0', '400': '#F7C970', '500': '#F4B740', '600': '#D39E35', '700': '#B2852B', '800': '#8F6A20', '900': '#705216', '950': '#58400E' },
    danger: { '50': '#FDF4F4', '100': '#FBE5E6', '200': '#F7C8CA', '300': '#F2A4A6', '400': '#EC767A', '500': '#E5484D', '600': '#C63D42', '700': '#A73236', '800': '#87272A', '900': '#6A1D20', '950': '#541517' },
    info: { '50': '#F3F6FE', '100': '#E2EBFC', '200': '#C1D4F9', '300': '#97B7F5', '400': '#6393F0', '500': '#2F6FEB', '600': '#2860CD', '700': '#2252AF', '800': '#1B4290', '900': '#143573', '950': '#102A5E' }
  },
  borderRadius: { none: '0px', sm: '8px', md: '12px', lg: '16px', xl: '22px', pill: '999px' },
  spacing: { '0': '0px', '1': '4px', '2': '8px', '3': '12px', '4': '16px', '5': '20px', '6': '24px', '8': '32px', '10': '40px', '12': '48px', '16': '64px' },
  fontFamily: {
    display: ['Fraunces', 'Georgia', 'serif'],
    sans: ['Instrument Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
  },
  fontSize: { xs: '12px', sm: '13px', base: '14px', md: '16px', lg: '18px', xl: '22px', '2xl': '26px', '3xl': '34px', '4xl': '44px', '5xl': '52px' },
  boxShadow: {
    sm: '0 1px 2px rgba(14,28,43,.06), 0 1px 3px rgba(14,28,43,.05)',
    md: '0 4px 12px rgba(14,28,43,.08), 0 2px 4px rgba(14,28,43,.04)',
    lg: '0 16px 40px rgba(14,28,43,.12)'
  },
  transitionTimingFunction: {
    standard: 'cubic-bezier(.2,.7,.2,1)',
    emphasized: 'cubic-bezier(.2,.8,.2,1)'
  },
  transitionDuration: {
    fast: '120ms',
    base: '180ms',
    slow: '280ms'
  }
}
