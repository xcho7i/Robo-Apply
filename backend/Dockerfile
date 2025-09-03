# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install --legacy-peer-deps

RUN npm install nodemon -g

# Copy the rest of the application code to the container
COPY .env .

COPY . .

# Expose the desired port
EXPOSE 3000

# Prevent the browser from opening automatically
ENV BROWSER none

# Start the application
CMD ["npm", "start"]