use: {
  loader: 'babel-loader',
  options: {
    presets: ['preset'],
    ignore: [ './node_modules/mapbox-gl/dist/mapbox-gl.js' ],
    use: { loader: 'worker-loader' }
  }
}
