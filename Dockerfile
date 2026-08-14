FROM node:20-slim

# Install canvas C++ dependencies for Linux Cloud Server
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    giflib-tools \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Explicit environment variables for Render Cloud Deployment
ENV NODE_ENV=production
ENV RENDER=true
ENV RENDER_EXTERNAL_URL=https://csreport.onrender.com

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "bot.js"]
