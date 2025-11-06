# ⚙️ ToDo API - Backend

A secure and modern REST API built with **Node.js, Express, and MongoDB**, serving as the backend for the **ToDo List - My Day** web application.

This API handles **user authentication**, **task management**, and **data persistence** using **JWT tokens** and a **MongoDB database**.  
It is deployed and fully functional in production, but **not intended for local installation or cloning**.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Deployment & Access](#deployment--access)
3. [Important Notes](#important-notes)
4. [Main Features](#main-features)
   - [Authentication](#authentication)
   - [Task Management](#task-management)
5. [Example Endpoints](#example-endpoints)
   - [Authentication](#authentication)
   - [Tasks](#tasks)
6. [Technologies Used](#technologies-used)
7. [API Logic Highlights](#api-logic-highlights)
8. [Acknowledgments](#acknowledgments)
9. [Related Links](#related-links)
10. [Note](#note)

---

## Overview

The backend exposes a RESTful API that supports:
- ✅ User registration and login (email or Google)
- ✅ Secure JWT authentication
- ✅ CRUD operations on tasks
- ✅ Task reordering (Drag & Drop support)
- ✅ Database persistence with Mongoose
- ✅ CORS configuration for specific frontend origins

---

## Deployment & Access

- **Frontend**: https://todo-front-mu.vercel.app/  
- **API Base URL**: (private, configured via environment variables)
- The API is hosted on **Render** or **Koyeb**, and is **restricted to accept requests only from allowed origins** (to prevent CORS issues).

---

## Important Notes

- This repository **should not be cloned or executed locally**.  
  It relies on private environment variables (`.env`) containing:
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=

Without these, the server **will not start**.

---

- The **CORS configuration** explicitly allows requests **only** from trusted origins:

origin: [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://todo-list-tau-ten-35.vercel.app",
]

Any other URL will be rejected to maintain security.

## Main Features

### Authentication
User login with email/password

Google OAuth integration

Passwords hashed with bcrypt

Authenticated routes secured via JWT middleware

### Task Management
Full CRUD (Create, Read, Update, Delete)

Task reordering via drag-and-drop, synchronized with MongoDB

User-based isolation: each user accesses only their own tasks

Smooth error handling with clear status codes and messages

---

## Example Endpoints

### Authentication

| Method | Endpoint          | Description                     |
| :----- | :---------------- | :------------------------------ |
| `POST` | `/api/auth`       | Login user and return JWT token |
| `POST` | `/api/user`       | Register new user               |
| `POST` | `/api/user/email` | Check if an email exists        |


### Tasks

| Method   | Endpoint                 | Description                      |
| :------- | :----------------------- | :------------------------------- |
| `GET`    | `/api/tasks`             | Get all tasks for logged-in user |
| `POST`   | `/api/tasks`             | Create new task                  |
| `PATCH`  | `/api/tasks/:id`         | Update task (title/status)       |
| `DELETE` | `/api/tasks/:id`         | Delete task                      |
| `PATCH`  | `/api/tasks/:id/reorder` | Reorder tasks                    |


All task routes require a valid Authorization: Bearer <token> header.

## Technologies Used

Node.js – Runtime environment

Express.js – API framework

MongoDB + Mongoose – Database and ORM

JWT (jsonwebtoken) – Authentication and authorization

bcrypt – Secure password hashing

dotenv – Environment variable management

CORS – Origin control and API security

## API Logic Highlights

Each controller follows clean, modular structure for maintainability.

The reorderTask() endpoint supports atomic operations using MongoDB’s bulkWrite() for consistent updates.

Custom error handling provides meaningful HTTP responses (400, 401, 404, 500).

## Acknowledgments

Special thanks to Inma Contreras, my instructor from the Certificado de Profesionalidad IFCD0210 – Desarrollo de Aplicaciones con Tecnologías Web,
for her guidance, inspiration, and continuous encouragement throughout the learning process.

Also, big thanks to my classmates for their valuable feedback, advice, and collaboration during the development of this API. 🙌

## Related Links

🌍 Frontend App: https://todo-front-mu.vercel.app/
💻 Backend GitHub: https://github.com/Radu-A/todo-server
👤 My GitHub: https://github.com/Radu-A
💼 LinkedIn: https://www.linkedin.com/in/victor-outeiro/

## Note:
This API is part of a complete MERN-style project focused on learning and practicing full-stack development with authentication, data persistence, and front–back integration.