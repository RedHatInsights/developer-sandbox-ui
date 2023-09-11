const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const commonPlugins = require('./plugins');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  useProxy: true,
  localChrome: process.env.LOCAL_CHROME,
  appUrl: process.env.BETA ? '/beta/openshift/sandbox' : '/openshift/sandbox',
  env: `${process.env.ENVIRONMENT || 'stage'}-${
    process.env.BETA ? 'beta' : 'stable'
  }`,
  standalone: Boolean(process.env.STANDALONE),
});
plugins.push(...commonPlugins);

module.exports = {
  ...webpackConfig,
  plugins,
};
