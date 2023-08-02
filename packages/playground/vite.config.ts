import { config } from 'dotenv'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import viteCompression from 'vite-plugin-compression'
import tsconfigPaths from 'vite-tsconfig-paths'
// import polyfillNode from 'rollup-plugin-polyfill-node'

function getBaseUrl() {
  config()
  const { NODE_ENV, HOMEPAGE } = process.env
  if (NODE_ENV === 'development') return './'
  if (HOMEPAGE && HOMEPAGE.length > 0) return HOMEPAGE
  return require('./package.json').homepage
}

// https://vitejs.dev/config/
export default defineConfig({
  base: getBaseUrl(),
  resolve: {
    alias: {
      '~~': resolve(__dirname, 'source'),
      '@collective-governance/hardhat': '@collective-governance/hardhat/typechain-types'
    }
  },
  optimizeDeps: {
    exclude: ['@collective-governance/hardhat', 'crypto']
  },
  plugins: [
    // polyfillNode(),
    react(),
    svgr(),
    tsconfigPaths(),
    viteCompression()
  ]
})
