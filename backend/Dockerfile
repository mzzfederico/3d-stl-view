# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN corepack enable pnpm
RUN pnpm add @nestjs/cli
RUN pnpm i

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN pnpm run build

ENV NODE_ENV=production
# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["pnpm", "start"]
