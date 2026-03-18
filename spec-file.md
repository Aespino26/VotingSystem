Web-Based School E-Voting System — Spec v0.0.2

Goal: A simple website where students can vote online, and admin manages the system.

1) Scope
Included

Student login

User dashboard

Admin dashboard

View candidates

Vote system

Auto vote counting

Results display

Admin can manage candidates (CRUD)

Not Included

Mobile app

Biometric login

Advanced features

2) Technology

Frontend: HTML, CSS, JavaScript

Backend: PHP / Node.js / NestJS

Database: MySQL

3) Features
Student (User)

Login using student ID

View dashboard

See candidates

Vote once

View status/results

Admin

Login to admin dashboard

Add, edit, delete candidates

View votes and results

Voting

Choose one candidate per position

Submit vote

System counts votes automatically

4) API Example
GET /api/hello

Response:

{
  "message": "Welcome to E-Voting System"
}
5) Acceptance Criteria

Works in browser

Students & admin can log in

Has user & admin dashboard

Admin can manage candidates

Students can vote once only

Votes are counted automatically

Results are displayed