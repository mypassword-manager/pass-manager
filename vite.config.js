import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Replace 'my-personal-vault' with your exact GitHub repository name
export default defineConfig({
  plugins: [vue()],
  base: '/my-personal-vault/',
  server: {
    port: 3000
  }
})
