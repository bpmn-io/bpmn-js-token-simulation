import { string } from 'rollup-plugin-string';

export default {
  input: 'src/icons/index.js',
  output: {
    file: 'lib/icons/index.js',
    format: 'esm'
  },
  plugins: [
    string({
      include: '**/*.svg'
    })
  ]
};