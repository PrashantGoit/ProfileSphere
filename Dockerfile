# Use the official Playwright image which comes with browsers and Node.js
FROM mcr.microsoft.com/playwright:v1.54.1-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Set the entrypoint to run the CLI tool
ENTRYPOINT ["node", "server.js"]
