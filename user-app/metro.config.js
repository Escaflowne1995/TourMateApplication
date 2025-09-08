const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add .cjs extension to support Firebase modules
defaultConfig.resolver.sourceExts.push('cjs');

// Add SVG support
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
defaultConfig.resolver.sourceExts.push('svg');

defaultConfig.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Disable package exports to avoid Firebase module loading issues
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig; 