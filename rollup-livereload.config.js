import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.min.js',
    format: 'iife',
    name: 'bundle',
  },
  plugins: [nodeResolve(), typescript(), livereload()],
};
