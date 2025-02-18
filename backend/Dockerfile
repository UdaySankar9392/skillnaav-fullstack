# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Install system dependencies required for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Ensure npm runs with proper permissions
ENV npm_config_unsafe_perm=true

# Copy package.json and package-lock.json first to optimize caching
COPY package*.json ./

# Remove bcrypt first (in case it's installed incorrectly)
RUN npm uninstall bcrypt || true

# Install dependencies (without bcrypt initially)
RUN npm ci --omit=dev

# Manually install bcrypt (forces a fresh build)
RUN npm install bcrypt --build-from-source

# Copy backend source code
COPY . .

# Ensure bcrypt is properly rebuilt
RUN npm rebuild bcrypt --build-from-source

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["npm", "start"]