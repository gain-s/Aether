# .devcontainer/Dockerfile (v02 - mon 7th jul 2025)
FROM mcr.microsoft.com/devcontainers/javascript-node:18-bullseye

# Install global dependencies (like concurrently) once
RUN npm install -g concurrently

# Set the working directory inside the container
# WORKDIR /workspaces/app
WORKDIR /workspaces/${localWorkspaceFolderBasename}

# --- Backend Dependencies ---
# Copy only package files first to leverage caching
COPY backend/package*.json ./backend/
# Install dependencies
RUN npm --prefix backend install

# --- Frontend Dependencies ---
COPY frontend/package*.json ./frontend/
RUN npm --prefix frontend install

# --- Playwright ---
# Install playwright browsers. This is slow, so caching it is a huge win.
COPY backend/package*.json ./backend/
# or wherever playwright is a dependency
RUN npx playwright install --with-deps

# Now copy the rest of the source code
# This ensures that code changes don't invalidate the npm install cache layer
COPY . .

# Ensure the 'node' user (used by the dev container) owns the files
RUN chown -R node:node /workspaces/${localWorkspaceFolderBasename}

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
    zsh \
    build-essential python3 make gcc g++ sqlite3 libsqlite3-dev \
    && sudo apt-get clean && sudo rm -rf /var/lib/apt/lists/*