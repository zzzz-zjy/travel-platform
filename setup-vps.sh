#!/bin/bash
set -e

echo "=== Travel Platform VPS Setup ==="

# 1. Install Node.js 20 (if not present)
if ! command -v node &>/dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node.js: $(node --version)"

# 2. Install pm2
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

# 3. Install git if needed
if ! command -v git &>/dev/null; then
  apt-get install -y git
fi

# 4. Clone repo (or pull if exists)
APP_DIR="/opt/travel-platform"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git pull origin master
else
  git clone git@github.com:zzzz-zjy/travel-platform.git "$APP_DIR"
  cd "$APP_DIR"
fi

# 5. Set up env file - YOU NEED TO CREATE THIS MANUALLY
if [ ! -f .env.local ]; then
  echo "WARNING: .env.local not found! Copy it from your local machine."
  echo "  scp .env.local root@47.108.166.74:$APP_DIR/.env.local"
fi

# 6. Install deps and build
npm install
npx prisma generate
npm run build

# 7. Start with pm2
pm2 delete travel-platform 2>/dev/null || true
pm2 start npm --name "travel-platform" -- start
pm2 save

# 8. Auto-start on boot
pm2 startup systemd -u root --hp /root
pm2 save

echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "1. Copy .env.local to $APP_DIR/.env.local"
echo "2. Set up GitHub Actions self-hosted runner:"
echo "   Go to: https://github.com/zzzz-zjy/travel-platform/settings/actions/runners/new"
echo "   Select 'Linux', follow the instructions"
echo "3. pm2 logs travel-platform  # view logs"
