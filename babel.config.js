module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          targets: {
            browsers: [
              'last 2 versions',
              'safari >= 9',
              'ios >= 9',
              'not ie <= 11',
              '> 1%'
            ]
          },
          useBuiltIns: 'usage',
          corejs: 3,
          loose: true
        }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
  ]
};