# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/javascript-node:18-bullseye

# Install OS dependencies needed for Puppeteer and other tools
# This RUN command will be cached, making rebuilds much faster
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    # Puppeteer dependencies
    wget gnupg ca-certificates fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 \
    libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
    libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
    libxrandr2 libxrender1 libxss1 libxtst6 lsb-release xdg-utils \
    # Other useful tools
    build-essential python3 make gcc g++ sqlite3 libsqlite3-dev \
    # Playwright browser dependencies
    libwoff1 \
    libopus0 \
    libflite1 \
    libharfbuzz-icu0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0 \
    libmanette-0.2-0 \
    libdw1 \
    libegl1 \
    libglx0 \
    libgudev-1.0-0 \
    libgles2 \
    libx264-155 \
    libx264-dev \
    --no-install-recommends && \
    sudo apt-get clean && sudo rm -rf /var/lib/apt/lists/*