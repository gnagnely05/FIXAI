const fs = require('fs');
const path = require('path');

const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'app.json'), 'utf-8'));

module.exports = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    kotlinVersion: '1.9.25',
  },
  plugins: [
    ...appJson.expo.plugins,
    [
      '@react-native-community/hooks',
      {
        android: {
          kotlinVersion: '1.9.25',
        },
      },
    ],
  ],
};

