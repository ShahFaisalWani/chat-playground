# Chat Playground

This chat playground web application is built with Next.js (TS), TailwindCSS, Flask, MongoDB and uses Docker for containerization.

## Key Features

- Integrates OpenAI's API and Typhoon LLM for generating messages.
- Streaming for realtime chat completions.
- Websocket for realtime interactive updates.
- Chats support code blocks, markdown rendering, and offer copy and regenerate response functionalities.
- Parameter adjusments, chat management, authentications.
- Chakra UI for styling and component library.

## Prerequisites

Before starting, ensure you have the following installed on your local machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Overall Structure

```bash

├── client/                     # Frontend application
│   └── Dockerfile              # Dockerfile for the Next.js app
├── server/                     # Backend Flask application
│   ├── Dockerfile              # Dockerfile for the Flask app
│   ├── requirements.txt        # Python dependencies
│   └── server.py               # Main entry point for the Flask app
├── docker-compose.yml          # Docker Compose for local development environment
└── README.md                   # Project documentation
```

## Setup

### 1. Clone the repository or download manually

```bash
git clone https://github.com/ShahFaisalWani/chat-playground.git
cd chat-playground
```

### 2. Configure environment variable

Create a <strong>.env</strong> file in the project root directory (same level as this README file) and add the following environment variables:

#### **Note: The only thing you have to change is `OPENAI_API_KEY`. Please get the Typhoon Open API from [here](https://opentyphoon.ai/). The rest can leave as is.**

```bash
OPENAI_API_KEY = your-typhoon-api-key

NEXT_PUBLIC_API_BASE_URL = http://localhost:5001
NEXT_PUBLIC_API_URL = ${NEXT_PUBLIC_API_BASE_URL}/api
MONGO_URI = mongodb://mongo:27017/chatPlayground
JWT_SECRET = supersecret
```

### 3. Build and start the application

```bash
docker-compose up --build
```

### 4. Access the application

### Visit the website at `http://localhost:3000`

### The flask will be hosted at `http://localhost:5001` and mongodb at `http://localhost:27017`

<br></br>

# TODO (maybe)

- Chat pagination
- Chat history pagination
- Search Chat History
- Implement OAuth
- Usage throttle / Rate limit
- Theme customization

# Extra Details

### 1. Frontend Features

- Zustand for managing application states (storing chat histories, chat messages, auth states).
- Context for managing application logics and core functionalities (apis, auths, chats, websocket).
- Custom hooks for calling api, making http request, handling streaming and notifications.
- Real-time response streaming: SSE (Server-Sent Events), a one way real-time updates from server to client over HTTP.
- Chatting features.
  - Start new chat.
  - Edit chat message.
  - Regenerate response.
  - View code block, markups.
  - Token count and spead.
  - Copy or vote response as feedback.
- Parameter adjustment lets users modify model settings like top_p and output_length to customize response generation.
- Allow different model selections for generating responses.

### 2. Backend Features:

- CRUD functionality for storing and retrieving user accounts (login, register, authentication).
- Managing chat histories.
- Storing messages as well as params, user details and feedback (upvotes/downvotes).
- OpenAI api and typhoon model with streaming response.
- Websocket for broadcasting updates such as on vote or on delete chat.
- Middleware such as checking for valid JWT tokens on request.
- Handlers for separating functions and making the app more modularized

### 3. Parameters:

- **output_length**: Maximum number of tokens to generate in the response, controlling response size.
- **temperature**: Adjusts randomness; higher values (e.g., 1.0) make responses more random, lower values make them deterministic.
- **top_p**: Nucleus sampling; chooses tokens from the smallest group whose cumulative probability is above the **threshold**.
- **repetition_penalty**: Penalizes repeating words or phrases to make responses more diverse and avoid repetition.

<br></br>

# API Documentation

## **Authentication Endpoints**

### **Register User**

- **Endpoint**: `/register`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

* **Response**:Returns the details of the registered user or an error message.

### **Login User**

- **Endpoint**: `/login`
- **Method**: `POST`
- **Description**: Logs in a user and returns a JWT token.

  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

- **Response**:A JWT token for authenticated access.

### Get User by ID

- **Endpoint**: `/users/`
- **Method**: `GET`
- **Description**: Retrieves user details by user ID.
- **Headers**: Authorization: Bearer
- **Response**: User details (ID, username, email).

## Chat Endpoints

### Create New Chat

- **Endpoint**: `/chats`
- **Method**: `POST`
- **Description**: Creates a new chat session.
- **Headers**: Authorization: Bearer
  ```json
  {
    "chat_id": "string",
    "user_id": "string",
    "message": "string",
    "message_id": "string",
    "message_index": "integer",
    "parameters": {
      "model": "string",
      "output_length": "integer",
      "temperature": "float",
      "top_p": "float",
      "repetition_penalty": "float"
    }
  }
  ```
- **Response**: Returns the chat and message details.

### Stream Chat

- **Endpoint**: `/chats/stream`
- **Method**: `POST` or `GET`
- **Description**: Streams a chat completion response in real-time.
- **Headers**: Authorization: Bearer
- **Query Params**:

  - `user_id`: The ID of the user.
  - `chat_id`: The ID of the chat session.

- **Response**: Streams real-time chat completions.

### Get Messages of a Chat

- **Endpoint**: `/chats/messages`
- **Method**: `GET`
- **Description**: Retrieves all messages in a specific chat.
- **Headers**: Authorization: Bearer
- **Response**: Returns a list of messages for the specified chat.

### Get User's Chats

- **Endpoint**: `/chats`
- **Method**: `GET`
- **Description**: Fetches all chat sessions for a user.
- **Headers**: Authorization: Bearer
- **Query Params**:

  - `user_id`: The ID of the user.

- **Response**:List of chat sessions for the user.

### Vote on a Message

- **Endpoint**: `/chats/vote`
- **Method**: `POST`
- **Description**: Upvote or downvote a message.
- **Headers**: Authorization: Bearer
  ```json
  {
    "message_id": "string",
    "vote": "upvote" | "downvote"
  }
  ```
- **Response**: A confirmation of the vote or error message.

### Delete a Chat

- **Endpoint**: `/chats/delete`
- **Method**: `POST`
- **Description**: Deletes a specific chat session.
- **Headers**: Authorization: Bearer
  ```json
  {
    "chat_id": "string"
  }
  ```
- **Response**: A confirmation of the deletion.

## Authentication Middleware

- **Token Required**:The @token_required middleware is applied to protected routes. It verifies the JWT token in the Authorization header before allowing access to the route.

## Error Responses

- **400**: Bad Request – Missing or invalid parameters.
- **401**: Unauthorized – Invalid or missing JWT token.
- **404**: Not Found – Resource does not exist.
- **500**: Internal Server Error – An unexpected error occurred.
