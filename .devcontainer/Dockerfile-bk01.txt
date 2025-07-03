# .devcontainer/Dockerfile (Recommended for Playwright)
FROM mcr.microsoft.com/devcontainers/javascript-node:18-bullseye

# Install a few essential tools that Playwright's script might not cover
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    make \
    gcc \
    g++ \
    sqlite3 \
    libsqlite3-dev \
    # --- Puppeteer Core Dependencies ---
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    # Clean up APT cache
    && sudo apt-get clean \
    && sudo rm -rf /var/lib/apt/lists/*

# Use Playwright's own command to install browser dependencies.
# This is the most robust and recommended method.
# It requires Playwright to be in your package.json.
# We run this as the 'node' user since it uses npx.
USER node
RUN npx playwright install-deps
USER root
