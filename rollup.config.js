import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'src/index.ts',
  output: {
    file: 'built/bundle.min.js',
    format: 'iife',
    name: 'bundle',
  },
  plugins: [typescript(), livereload()],
};
