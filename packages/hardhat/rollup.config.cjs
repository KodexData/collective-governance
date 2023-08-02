import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import external from 'rollup-plugin-peer-deps-external'
import packageJson from './package.json'

export default [
  {
    input: 'typechain-types/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: false
      },
      {
        file: packageJson.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: false
      }
    ],
    external: [/@collective-governance\/*/, /@ethersproject\/*/, 'ethers'],
    plugins: [
      external(),
      json(),
      resolve({ preferBuiltins: false }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.rollup.json',
        compilerOptions: { declarationDir: './types' }
      })
    ]
  }
]
