import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.devdoc.app',
  productName: 'DevDoc',
  directories: {
    output: 'dist',
    buildResources: '.'
  },
  files: ['out/**/*'],
  mac: {
    target: { target: 'dmg', arch: 'arm64' },
    icon: 'DevDoc_icon.png'
  }
}

export default config
