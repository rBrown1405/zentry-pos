# Zentry POS API Documentation

This document provides detailed information about the Zentry POS API endpoints, authentication, and data models.

## Base URL

For development: `http://localhost:3000/api`

## Authentication

The API uses JWT (JSON Web Token) based authentication.

### Authentication Endpoints

#### Register a New User

```
POST /api/auth/register
```

Request Body:
```json
{
  "username": "username",
  "email": "user@example.com",
  "password": "password123",
  "role": "admin"  // Optional, defaults to "user". Options: "user", "admin", "super_admin"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "admin",
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### Login

```
POST /api/auth/login
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "admin",
    "business": "business_id",  // If applicable
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### Refresh Token

```
POST /api/auth/refresh-token
```

Request Body:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

#### Get User Profile

```
GET /api/auth/me
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "admin",
    "business": {
      "_id": "business_id",
      "name": "Business Name"
    }
  }
}
```

## Businesses

### Business Endpoints

#### Create a Business

```
POST /api/businesses
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Request Body:
```json
{
  "name": "Business Name",
  "address": "123 Business St, City, Country",
  "phone": "+1234567890",
  "email": "business@example.com"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "business_id",
    "name": "Business Name",
    "address": "123 Business St, City, Country",
    "phone": "+1234567890",
    "email": "business@example.com",
    "properties": [],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Get All Businesses

```
GET /api/businesses
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "business_id1",
      "name": "Business 1",
      "address": "Address 1",
      "phone": "Phone 1",
      "email": "business1@example.com",
      "properties": ["property_id1"],
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    {
      "_id": "business_id2",
      "name": "Business 2",
      "address": "Address 2",
      "phone": "Phone 2",
      "email": "business2@example.com",
      "properties": [],
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

#### Get a Single Business

```
GET /api/businesses/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "business_id",
    "name": "Business Name",
    "address": "123 Business St, City, Country",
    "phone": "+1234567890",
    "email": "business@example.com",
    "properties": ["property_id1", "property_id2"],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Update a Business

```
PUT /api/businesses/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Request Body:
```json
{
  "name": "Updated Business Name",
  "address": "Updated Address",
  "phone": "Updated Phone",
  "email": "updated@example.com"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "business_id",
    "name": "Updated Business Name",
    "address": "Updated Address",
    "phone": "Updated Phone",
    "email": "updated@example.com",
    "properties": ["property_id1", "property_id2"],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Delete a Business

```
DELETE /api/businesses/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

## Properties

### Property Endpoints

#### Create a Property

```
POST /api/properties
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Request Body:
```json
{
  "name": "Property Name",
  "address": "123 Property St, City, Country",
  "businessId": "business_id",  // Optional for admins with business context
  "isMainProperty": false  // Optional, defaults to false
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "property_id",
    "name": "Property Name",
    "address": "123 Property St, City, Country",
    "business": "business_id",
    "isMainProperty": false,
    "propertyCode": "PROP123456",
    "connectionCode": "ABC123",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Get All Properties

```
GET /api/properties
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "property_id1",
      "name": "Property 1",
      "address": "Address 1",
      "business": {
        "_id": "business_id",
        "name": "Business Name"
      },
      "isMainProperty": true,
      "propertyCode": "PROP123456",
      "connectionCode": "ABC123",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    {
      "_id": "property_id2",
      "name": "Property 2",
      "address": "Address 2",
      "business": {
        "_id": "business_id",
        "name": "Business Name"
      },
      "isMainProperty": false,
      "propertyCode": "PROP654321",
      "connectionCode": "XYZ789",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

#### Get a Single Property

```
GET /api/properties/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "property_id",
    "name": "Property Name",
    "address": "123 Property St, City, Country",
    "business": {
      "_id": "business_id",
      "name": "Business Name"
    },
    "isMainProperty": false,
    "propertyCode": "PROP123456",
    "connectionCode": "ABC123",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Update a Property

```
PUT /api/properties/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Request Body:
```json
{
  "name": "Updated Property Name",
  "address": "Updated Address",
  "isMainProperty": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "property_id",
    "name": "Updated Property Name",
    "address": "Updated Address",
    "business": "business_id",
    "isMainProperty": true,
    "propertyCode": "PROP123456",
    "connectionCode": "ABC123",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Delete a Property

```
DELETE /api/properties/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

## Users

### User Endpoints

#### Get All Users

```
GET /api/users
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "user_id1",
      "username": "user1",
      "email": "user1@example.com",
      "role": "admin",
      "business": {
        "_id": "business_id",
        "name": "Business Name"
      },
      "lastLogin": "timestamp",
      "active": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    {
      "_id": "user_id2",
      "username": "user2",
      "email": "user2@example.com",
      "role": "user",
      "business": {
        "_id": "business_id",
        "name": "Business Name"
      },
      "lastLogin": "timestamp",
      "active": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

#### Get a Single User

```
GET /api/users/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "admin",
    "business": {
      "_id": "business_id",
      "name": "Business Name"
    },
    "lastLogin": "timestamp",
    "active": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Create a User

```
POST /api/users
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Request Body:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",  // Optional, defaults to "user"
  "businessId": "business_id"  // Optional for super_admin
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "business": "business_id"
  }
}
```

#### Update a User

```
PUT /api/users/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Request Body:
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "password": "newpassword123",  // Optional
  "role": "admin",  // Optional
  "active": false  // Optional
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "updateduser",
    "email": "updated@example.com",
    "role": "admin",
    "business": "business_id",
    "lastLogin": "timestamp",
    "active": false,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Delete a User

```
DELETE /api/users/:id
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Response:
```json
{
  "success": true,
  "data": {}
}
```

#### Assign User to Business

```
PUT /api/users/:id/assign-business
```

Headers:
```
Authorization: Bearer jwt_access_token
```

Request Body:
```json
{
  "businessId": "business_id"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "admin",
    "business": "business_id"
  }
}
```

## Error Responses

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (development mode only)"
}
```

For validation errors:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- General API endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: 10 requests per 15 minutes per IP

When rate limiting is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

## Authentication Flow

1. Register a user or login with existing credentials
2. Store the access token and refresh token
3. Use the access token in the Authorization header for all protected routes
4. When the access token expires, use the refresh token to get a new access token
5. If the refresh token is invalid or expired, the user must log in again

## Security Best Practices

1. Store tokens securely (HTTP-only cookies or secure storage)
2. Include the Authorization header with every request to protected endpoints
3. Implement token refresh logic when access tokens expire
4. Log out users by removing tokens on the client side
5. For security-sensitive operations, consider re-authenticating the user
