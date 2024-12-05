# Step 1: Use Node.js base image
FROM node:16

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install production dependencies
RUN npm install --production

# Step 5: Copy the rest of the app
COPY . .

# Step 6: Expose the app port
EXPOSE 3000

# Step 7: Start the app
CMD ["node", "dist/server.js"]
