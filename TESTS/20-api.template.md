# API Specification

## Overview

The E-Voting System API follows RESTful principles and uses JSON for request/response payloads. All endpoints require authentication except for the health check and results display.

## Authentication

### POST /api/auth/login
Authenticate users and return JWT token.

**Request Body:**
```json
{
  "studentId": "string", // For students
  "username": "string", // For admins
  "password": "string"  // For admins
}
```

**Response (200 OK):**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "string",
    "role": "student|admin"
  }
}
```

**Error Responses:**
- 401 Unauthorized: Invalid credentials
- 400 Bad Request: Missing required fields

## Candidates

### GET /api/candidates
Retrieve all candidates grouped by position.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "positions": [
    {
      "name": "President",
      "candidates": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "position": "string"
        }
      ]
    }
  ]
}
```

### POST /api/candidates (Admin Only)
Create a new candidate.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "position": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "position": "string",
  "createdAt": "ISO_date_string"
}
```

### PUT /api/candidates/:id (Admin Only)
Update an existing candidate.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "position": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "position": "string",
  "updatedAt": "ISO_date_string"
}
```

### DELETE /api/candidates/:id (Admin Only)
Delete a candidate.

**Response (204 No Content)**

## Voting

### GET /api/votes/status
Check if current user has already voted.

**Response (200 OK):**
```json
{
  "hasVoted": false,
  "positions": ["President", "Vice President"]
}
```

### POST /api/votes
Submit a vote for multiple positions.

**Request Body:**
```json
{
  "votes": [
    {
      "position": "President",
      "candidateId": "string"
    },
    {
      "position": "Vice President",
      "candidateId": "string"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Vote submitted successfully",
  "voteId": "string"
}
```

**Error Responses:**
- 409 Conflict: User has already voted
- 400 Bad Request: Invalid candidate IDs

## Results

### GET /api/results
Retrieve current voting results.

**Response (200 OK):**
```json
{
  "results": [
    {
      "position": "President",
      "totalVotes": 150,
      "candidates": [
        {
          "id": "string",
          "name": "string",
          "votes": 75,
          "percentage": 50.0
        }
      ]
    }
  ],
  "totalVoters": 200,
  "votedCount": 150
}
```

## Admin Endpoints

### GET /api/admin/dashboard (Admin Only)
Get admin dashboard statistics.

**Response (200 OK):**
```json
{
  "totalCandidates": 10,
  "totalVotes": 150,
  "totalStudents": 200,
  "votingProgress": 75.0
}
```

### GET /api/admin/votes (Admin Only)
Get detailed vote information.

**Response (200 OK):**
```json
{
  "votes": [
    {
      "id": "string",
      "studentId": "string",
      "position": "string",
      "candidateName": "string",
      "timestamp": "ISO_date_string"
    }
  ]
}
```

## Health Check

### GET /api/hello
System health check endpoint.

**Response (200 OK):**
```json
{
  "message": "Welcome to E-Voting System",
  "timestamp": "ISO_date_string",
  "version": "0.0.2"
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "ErrorType",
  "message": "Human readable error message",
  "statusCode": 400
}
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- Voting endpoints: 10 requests per minute per user
- General endpoints: 100 requests per minute per user

## API Versioning

Current API version is v1. All endpoints are prefixed with `/api/`. Future versions will use `/api/v2/` etc.