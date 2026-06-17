module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    restartOnFileChange: false,
    captureTimeout: 60000,
    browserDisconnectTimeout: 20000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    pingTimeout: 30000,
    client: {
      jasmine: {
        random: false,
      },
      clearContext: false,
    },
  });
};
