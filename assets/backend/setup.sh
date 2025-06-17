#!/bin/bash

# Zentry POS Backend Setup Script
# This script automates the setup of the Zentry POS backend system

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Zentry POS Backend Setup...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js before continuing.${NC}"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}MongoDB is not detected. Would you like to install it? (y/n)${NC}"
    read -r install_mongo
    if [[ $install_mongo == "y" ]]; then
        echo -e "${GREEN}Installing MongoDB...${NC}"
        brew tap mongodb/brew
        brew install mongodb-community
        brew services start mongodb/brew/mongodb-community
    else
        echo -e "${YELLOW}Skipping MongoDB installation. Make sure to configure your MongoDB URI in .env file.${NC}"
    fi
else
    echo -e "${GREEN}MongoDB is installed.${NC}"
    # Check if MongoDB is running
    if ! pgrep -x mongod > /dev/null; then
        echo -e "${YELLOW}MongoDB is not running. Starting MongoDB...${NC}"
        brew services start mongodb/brew/mongodb-community
    fi
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating .env file...${NC}"
    cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/zentrypos
PORT=3000
NODE_ENV=development
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=30d
ALLOWED_ORIGINS=http://localhost:5173
EOL
    echo -e "${GREEN}.env file created with random JWT secrets.${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# Create super admin user
echo -e "${YELLOW}Would you like to create a super admin user? (y/n)${NC}"
read -r create_admin
if [[ $create_admin == "y" ]]; then
    echo -e "${GREEN}Enter super admin email:${NC}"
    read -r admin_email
    echo -e "${GREEN}Enter super admin password:${NC}"
    read -r admin_password
    node scripts/create-super-admin.js "$admin_email" "$admin_password"
fi

# Start the server
echo -e "${YELLOW}Would you like to start the server now? (y/n)${NC}"
read -r start_server
if [[ $start_server == "y" ]]; then
    echo -e "${GREEN}Starting Zentry POS backend server...${NC}"
    npm run dev
else
    echo -e "${GREEN}Setup complete! Run 'npm run dev' to start the server in development mode.${NC}"
fi
