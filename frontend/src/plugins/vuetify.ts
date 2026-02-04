/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0F172A',   // Navy Blue escuro (Profissional)
          secondary: '#3B82F6', // Azul Vibrante (Tech)
          accent: '#F59E0B',    // Laranja
          surface: '#FFFFFF',
          background: '#F8FAFC', // Cinza azulado bem claro
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          'on-surface-variant': '#64748B', // Texto secundário
        },
      },
      dark: {
        colors: {
          primary: '#3B82F6',
          surface: '#1E293B',
          background: '#0F172A',
        }
      }
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      fontWeight: '600',
      elevation: 0,
      variant: 'flat',
      height: 44,
    },
    VCard: {
      rounded: 'xl',
      elevation: 0,
      variant: 'outlined',
      color: 'grey-lighten-2', // Borda sutil
    },
    VTextField: {
      variant: 'outlined',
      color: 'primary',
      density: 'comfortable'
    }
  },
})