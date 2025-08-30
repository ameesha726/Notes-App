#  Notes App (Next.js + FastAPI + MongoDB)

##  Project Description
The **Notes App** is a full-stack web application that allows users to **create, view, edit, and delete notes** securely.  
It is built with **Next.js** on the frontend and **FastAPI** on the backend, using **MongoDB** as the database.  
The application implements **JWT-based authentication**, so each user can access and manage only their own notes.

The frontend uses a **hand-crafted UI with Tailwind CSS** and lightweight state management with **Zustand**, providing a responsive and user-friendly interface.  
The backend is designed for **performance and scalability**, using asynchronous operations with Motor (MongoDB driver) and optimized API endpoints.

---

## ✨ Features
-  **User Authentication:** Sign up, sign in, and JWT-based secure access  
-  **Notes Management:** Create, read, update, and delete notes  
-  **Responsive Frontend:** Clean UI built with Tailwind CSS and reusable components  
-  **State Management:** Managed using Zustand for simplicity and efficiency  
-  **Backend API:** FastAPI with asynchronous MongoDB operations  
-  **Secure and Scalable:** JWT authentication and well-structured code  

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Zustand, Axios  
- **Backend:** FastAPI, Motor (MongoDB), Pydantic, JWT Authentication  
- **Database:** MongoDB  

---

## 🌐 Live Demo
👉 [https://notes-app](https://notes-app-b5ve.vercel.app/)  


---

## ⚙️ Installation & Running Locally

### 🔹 Backend
1. Navigate to backend folder  
   `cd backend`  

2. Create and activate virtual environment  
   `python -m venv venv`  
   `venv\Scripts\activate`  

3. Install dependencies  
   `pip install fastapi uvicorn[standard] motor pydantic python-jose[cryptography] passlib[bcrypt] python-dotenv`  

4. Run FastAPI server  
   `uvicorn main:app --reload --host 0.0.0.0 --port 8000`  

### 🔹 Frontend
1. Navigate to frontend folder  
   `cd frontend`  

2. Install dependencies  
   `npm install`  

3. Run Next.js frontend  
   `npm run dev`  

4. Open in browser  
   `http://localhost:3000`  
