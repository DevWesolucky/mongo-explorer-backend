module.exports = {
  apps: [
    {
      script: "dist/index.js",
      watch: ["dist"],
      // Delay between restart
      watch_delay: 1000,
      // Don't restar in dev mode (run time errors generates loop of restarts to close docker container)
      autorestart: false
    },
  ],
};
