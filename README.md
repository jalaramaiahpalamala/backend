# Student Management System

A comprehensive web-based student management system built with Node.js, Express, and SQLite.

## Features

- **User Management**: Create accounts, manage users, assign roles (Admin/Staff)
- **Student Management**: Add, edit, update, and delete student records
- **Course Management**: Manage courses and student enrollments
- **Grades Tracking**: Record and track student grades with automatic GPA calculation
- **Attendance Management**: Track student attendance for each course
- **Reports & Analytics**: Generate comprehensive reports and analytics on student performance
- **User Authentication**: Secure login system with JWT tokens and password hashing
- **Responsive Design**: Clean, professional UI with responsive design

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Server Port**: 3000

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup Steps

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Create data directory** (for SQLite database):
```bash
mkdir data
```

3. **Start the server**:
```bash
npm start
```

Or use nodemon for development:
```bash
npm run dev
```

4. **Open in browser**:
Navigate to `http://localhost:3000`

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Account Creation

### Self-Registration
Users can create their own accounts from the login page:
1. Click "Create one here" link on the login page
2. Fill in your full name, desired username, and password
3. Username must be 3+ characters
4. Password must be 6+ characters
5. Account will be created with "Staff" role by default

### Admin Registration
Administrators can create accounts for other staff members:
1. Login as Admin
2. Navigate to "Users" section (visible only to admins)
3. Click "+ Add User" button
4. Fill in details and select role (Staff or Admin)
5. New user can login immediately

## Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   └── database.js          # Database initialization & schema
└── routes/
    ├── auth.js              # Authentication routes
    ├── students.js          # Student management routes
    ├── courses.js           # Course management routes
    ├── grades.js            # Grades management routes
    ├── attendance.js        # Attendance management routes
    └── reports.js           # Reports & analytics routes

frontend/
├── index.html               # Login page
├── dashboard.html           # Main dashboard
├── students.html            # Student management page
├── courses.html             # Course management page
├── grades.html              # Grades management page
├── attendance.html          # Attendance management page
├── reports.html             # Reports & analytics page
├── css/
│   └── styles.css          # Main stylesheet
└── js/
    ├── app.js              # Main app logic
    └── utils.js            # Utility functions
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Self-register new account (public)
- `POST /api/auth/register-admin` - Register user by admin (admin only)
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/users` - Get all users (admin only)
- `DELETE /api/auth/users/:id` - Delete user (admin only)

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:courseId/enroll/:studentId` - Enroll student in course
- `GET /api/courses/:courseId/students` - Get enrolled students

### Grades
- `GET /api/grades` - Get all grades
- `GET /api/grades/student/:studentId` - Get student's grades
- `POST /api/grades` - Record grades
- `PUT /api/grades/:id` - Update grades
- `DELETE /api/grades/:id` - Delete grade record

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/student/:studentId` - Get student's attendance
- `GET /api/attendance/course/:courseId` - Get course attendance
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance record

### Reports
- `GET /api/reports/student/:studentId` - Generate student report card
- `GET /api/reports/class/:courseId` - Generate class analytics
- `GET /api/reports/attendance/:studentId` - Get attendance summary
- `GET /api/reports/all-students` - Get all students summary

## Features in Detail

### Grade Calculation
- Assignments (2): 15% each (30% total)
- Midterm: 30%
- Final Exam: 40%
- Letter grades: A, A-, B+, B, B-, C+, C, C-, D, F

### Attendance Tracking
- Present, Absent, Late status
- Attendance percentage calculation
- Remarks for special cases

### Reports
- Student report cards with GPA and grades
- Class performance analytics
- Attendance summaries
- All students overview

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Token expiration (24 hours)

## Future Enhancements

- Email notifications
- Bulk import/export functionality
- Advanced analytics and charts
- Parent portal
- Mobile application
- SMS notifications
- GPA improvement tracking

## License

MIT License

## Support

For issues or questions, please refer to the documentation or contact the development team.
