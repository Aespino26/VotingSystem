# Web-Based School E-Voting System

## Overview

A simple web-based system where students can vote online and admins manage candidates and results. This capstone project demonstrates full-stack development skills using modern web technologies.

## Features

### For Students
- Secure login using Student ID
- User-friendly dashboard
- Browse candidates by position
- Cast votes for multiple positions
- View real-time election results
- One-time voting enforcement

### For Administrators
- Secure admin login
- Complete candidate management (CRUD)
- Real-time voting statistics
- Election result monitoring
- User participation tracking

## Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Responsive design
- **JavaScript**: ES6+ features
- **Architecture**: Vanilla JS SPA

### Development Tools
- **Package Manager**: npm
- **Testing**: Jest
- **Linting**: ESLint
- **Build**: NestJS CLI

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database setup**
   ```sql
   CREATE DATABASE voting_system;
   ```

4. **Environment configuration**
   Create `.env` file:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=voting_system
   JWT_SECRET=your_jwt_secret
   ```

5. **Run database migrations**
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:3000`

## API Documentation

### Authentication
- `POST /api/auth/login` - User authentication

### Candidates
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create candidate (Admin)
- `PUT /api/candidates/:id` - Update candidate (Admin)
- `DELETE /api/candidates/:id` - Delete candidate (Admin)

### Voting
- `GET /api/votes/status` - Check voting status
- `POST /api/votes` - Submit votes

### Results
- `GET /api/results` - View election results

### Admin
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/admin/votes` - Detailed vote information

## Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts                # Application entry point
├── auth/                  # Authentication module
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── candidates/            # Candidates management
│   ├── candidates.module.ts
│   ├── candidates.service.ts
│   └── candidates.controller.ts
├── users/                 # User management
├── votes/                 # Voting system
├── common/                # Shared utilities
└── entities/              # Database entities

public/                    # Static frontend files
├── index.html
├── admin.html
├── student.html
├── register.html
├── css/
│   └── styles.css
└── js/
    └── app.js

test/                      # Test files
```

## Development

### Available Scripts
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

### Testing
```bash
# Run all tests
npm run test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:cov
```

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Environment Variables
Set the following environment variables for production:

- `NODE_ENV=production`
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `JWT_SECRET` - JWT signing secret
- `PORT` - Application port (default: 3000)

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Input validation on all endpoints
- SQL injection prevention
- HTTPS recommended for production
- Rate limiting implemented

## Performance

- Database connection pooling
- Query optimization with indexes
- In-memory caching for results
- Responsive design for mobile devices
- Optimized bundle size

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NestJS framework for the robust backend structure
- MySQL for reliable data persistence
- JWT for secure authentication
- The open-source community for various libraries and tools

Then open:

- http://localhost:3000 (login page)

---

## 🧪 Demo Accounts

- **Admin**
  - Student ID: `admin`
  - Password: `admin`

Students can register via the register page.

---

## 📄 Frontend Pages

| Page | URL |
|------|-----|
| Login | `/` |
| Register | `/register.html` |
| Student Dashboard | `/student.html` |
| Admin Dashboard | `/admin.html` |

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login (student/admin) |
| GET | `/api/auth/me` | Get current user (requires bearer token) |
| GET | `/api/candidates` | Get candidate list |
| POST | `/api/candidates` | Create candidate (admin only) |
| PUT | `/api/candidates/:id` | Update candidate (admin only) |
| DELETE | `/api/candidates/:id` | Delete candidate (admin only) |
| POST | `/api/votes` | Cast vote (student only) |
| GET | `/api/votes/me` | Fetch student vote history |
| GET | `/api/votes/results` | Get vote results |

---

## 🛠️ Notes

- Data is stored in `data/voting.sqlite` (created automatically).
- Admin privileges are enforced via JWT roles.
- If the server reports `EADDRINUSE`, another process is using port 3000. Stop it or set `PORT`.

---

## 🧩 Scripts

| Command | Description |
|--------|-------------|
| `npm run start` | Run production server |
| `npm run start:dev` | Run dev server (watch mode) |
| `npm run build` | Compile TypeScript to `dist/` |

---

Enjoy! 👋
