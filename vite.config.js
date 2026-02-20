import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [

    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    cors: {
      origin: 'http://localhost:8000', // The specific origin to allow (e.g., your backend app's origin)
      credentials: true, // If you need to send cookies or authentication headers
    },
    // ... other server options
  },
})
