# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Expose the port your NestJS app runs on (default 3000, but your gateway uses 3001)
EXPOSE 3001

# Start the NestJS application
CMD ["npm", "run", "start:prod"]