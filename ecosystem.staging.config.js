// PM2 Configuration for Staging Environment
// Created: December 29, 2024

module.exports = {
  apps: [{
    name: 'sitebango-staging',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/sitebango-staging',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      SMART_INTAKE_ENABLED: 'true',
      USE_ENHANCED_GENERATION: 'true'
    },
    error_file: '/var/log/sitebango/staging-error.log',
    out_file: '/var/log/sitebango/staging-out.log',
    log_file: '/var/log/sitebango/staging-combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 8000,
    kill_timeout: 5000
  }]
};