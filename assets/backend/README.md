# Zentry POS Backend

This is the backend API for Zentry POS system, providing REST APIs for business and property management, JWT authentication, and user management.

## Features

- MongoDB database integration
- Express.js API structure
- JWT-based authentication and role-based authorization
- CRUD operations for businesses, properties, and users
- Security best practices (rate limiting, input validation, etc.)
- Data migration from localStorage to MongoDB

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/zentrypos
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRE=30d
ALLOWED_ORIGINS=http://localhost:5173,https://example.com
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## Database Setup

1. Make sure MongoDB is installed and running:
```bash
brew services start mongodb/brew/mongodb-community
```

2. Verify the MongoDB connection:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

## Creating a Super Admin User

You can create a super admin user using the provided script:

```bash
npm run create-admin
```

Or with custom credentials:

```bash
node scripts/create-super-admin.js admin@example.com adminPassword
```

## Data Migration

To migrate existing data from localStorage to MongoDB:

```bash
node scripts/migrate-data.js path/to/localstorage-data.json
```

## Running API Tests

To test the API endpoints:

```bash
node scripts/test-api.js
```

## Security Features

- JWT Authentication with refresh tokens
- Role-based access control
- Input validation using express-validator
- Rate limiting
- CSRF Protection
- Security headers using helmet
- Password hashing using bcrypt

## API Endpoints

### Businesses

- `GET /api/businesses` - Get all businesses
- `POST /api/businesses` - Create a new business
- `GET /api/businesses/:id` - Get a specific business
- `PUT /api/businesses/:id` - Update a business
- `DELETE /api/businesses/:id` - Delete a business

### Properties

- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create a new property
- `GET /api/properties/:id` - Get a specific property
- `PUT /api/properties/:id` - Update a property
- `DELETE /api/properties/:id` - Delete a property

## Database Models

### Business Model

- `name`: String (required)
- `address`: String (required)
- `phone`: String (required)
- `email`: String (required)
- `properties`: Array of References to Property model

### Property Model

- `name`: String (required)
- `address`: String (required)
- `business`: Reference to Business model (required)
- `isMainProperty`: Boolean
- `propertyCode`: String (unique)
- `connectionCode`: String (unique)

### User Model

- `username`: String (required, unique)
- `email`: String (required, unique)
- `password`: String (required)
- `role`: String (enum: ['super_admin', 'admin', 'user'])
- `business`: Reference to Business model

## Frontend Integration

See the example `SuperAdminManager.js` class in the client-example folder for how to integrate the frontend with the backend API.
