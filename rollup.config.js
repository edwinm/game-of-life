import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'built',
    format: 'cjs'
  },
  plugins: [typescript()]
};
