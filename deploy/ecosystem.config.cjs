module.exports = {
  apps: [
    {
      name: 'dyntra-api',
      cwd: '/var/www/dyntra/backend',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
