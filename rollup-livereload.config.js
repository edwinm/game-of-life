import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import { terser } from "rollup-plugin-terser";
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: {
    file: 'built/bundle.min.js',
    format: 'iife',
    name: 'bundle',
  },
  plugins: [nodeResolve(), typescript(), terser(), livereload()],
};
