# Step 1: Use Node.js base image
FROM node:16 AS builder

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install development dependencies
RUN npm install

# Step 5: Copy the rest of the application
COPY . .

# Step 6: Compile TypeScript to JavaScript
RUN npx tsc

# Step 7: Create a production image
FROM node:16

# Step 8: Set the working directory
WORKDIR /usr/src/app

# Step 9: Copy production dependencies
COPY package*.json ./
RUN npm install --production

# Step 10: Copy the compiled JavaScript code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Step 12: Expose the port
EXPOSE 3001

# Step 13: Start the application
CMD ["node", "dist/server.js"]
