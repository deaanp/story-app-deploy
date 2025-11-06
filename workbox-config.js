module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,svg,json}'
  ],
  swSrc: 'src/public/sw.js',
  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};