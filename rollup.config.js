import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'built/bundle.min.js',
    format: 'iife',
    name: 'bundle',
  },
  plugins: [typescript()],
};
