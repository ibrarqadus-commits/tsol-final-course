# ER Diagram - LM Mastermind Course Platform

## Entities & Relationships

### Students
**Primary Key:** `id` (INTEGER, AUTOINCREMENT)

**Attributes:**
- `full_name` (TEXT, NOT NULL) - Student's full name
- `email` (TEXT, UNIQUE, NOT NULL) - Email address
- `phone_number` (TEXT) - Contact phone number
- `gmail_uid` (TEXT, UNIQUE) - Google OAuth UID
- `status` (TEXT, DEFAULT 'pending') - Account status (pending/approved/denied)
- `is_admin` (BOOLEAN, DEFAULT 0) - Admin flag
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Modules
**Primary Key:** `id` (INTEGER, AUTOINCREMENT)

**Attributes:**
- `module_name` (TEXT, NOT NULL) - Display name of the module
- `description` (TEXT) - Module description
- `access_type` (TEXT, DEFAULT 'requires_approval') - Access control type (open/requires_approval)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Access Requests
**Primary Key:** `id` (INTEGER, AUTOINCREMENT)

**Foreign Keys:**
- `student_id` → Students(id) [CASCADE DELETE]
- `module_id` → Modules(id) [CASCADE DELETE]

**Attributes:**
- `status` (TEXT, DEFAULT 'pending') - Request status (pending/approved/denied)
- `admin_comment` (TEXT) - Optional admin comment
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

**Unique Constraint:** (student_id, module_id) - One request per student-module pair

### Progress
**Primary Key:** `id` (INTEGER, AUTOINCREMENT)

**Foreign Keys:**
- `student_id` → Students(id) [CASCADE DELETE]
- `module_id` → Modules(id) [CASCADE DELETE]

**Attributes:**
- `progress_status` (TEXT, DEFAULT 'not_started') - Progress status (not_started/in_progress/completed)
- `percentage_completed` (INTEGER, DEFAULT 0) - Completion percentage (0-100)
- `last_updated` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

**Unique Constraint:** (student_id, module_id) - One progress record per student-module pair

### Messages
**Primary Key:** `id` (INTEGER, AUTOINCREMENT)

**Foreign Keys:**
- `student_id` → Students(id) [CASCADE DELETE]

**Attributes:**
- `message_content` (TEXT, NOT NULL) - Message text
- `status` (TEXT, DEFAULT 'unread') - Message status (read/unread)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

## Relationships

### Students → Access Requests (1-to-many)
- **One student** can have **multiple access requests** for different modules
- **Foreign Key:** `access_requests.student_id` → `students.id`
- **Delete Behavior:** CASCADE (delete requests when student is deleted)

### Modules → Access Requests (1-to-many)
- **One module** can have **multiple access requests** from different students
- **Foreign Key:** `access_requests.module_id` → `modules.id`
- **Delete Behavior:** CASCADE (delete requests when module is deleted)

### Students → Progress (1-to-many)
- **One student** has **progress tracking** for multiple modules
- **Foreign Key:** `progress.student_id` → `students.id`
- **Delete Behavior:** CASCADE (delete progress when student is deleted)

### Modules → Progress (1-to-many)
- **One module** has **progress records** for multiple students
- **Foreign Key:** `progress.module_id` → `modules.id`
- **Delete Behavior:** CASCADE (delete progress when module is deleted)

### Students → Messages (1-to-many)
- **One student** can send **multiple messages** to admin
- **Foreign Key:** `messages.student_id` → `students.id`
- **Delete Behavior:** CASCADE (delete messages when student is deleted)

## Database Constraints

### Foreign Key Constraints
- All foreign keys use CASCADE delete to maintain referential integrity
- Prevents orphaned records when parent entities are deleted

### Unique Constraints
- Students: `email`, `gmail_uid` (prevent duplicate accounts)
- Access Requests: `(student_id, module_id)` (one request per student-module)
- Progress: `(student_id, module_id)` (one progress record per student-module)

### Check Constraints
- Students.status: Must be 'pending', 'approved', or 'denied'
- Access Requests.status: Must be 'pending', 'approved', or 'denied'
- Progress.progress_status: Must be 'not_started', 'in_progress', or 'completed'
- Progress.percentage_completed: Must be between 0 and 100
- Messages.status: Must be 'read' or 'unread'
- Modules.access_type: Must be 'open' or 'requires_approval'

## Data Flow

### Student Registration Flow
1. Student signs in via Google OAuth
2. System creates/updates student record with Gmail UID
3. Student can request access to modules requiring approval
4. Admin reviews and approves/denies requests
5. Student gains access to approved modules

### Progress Tracking Flow
1. Student accesses approved modules
2. System tracks progress percentage and status
3. Progress updates are saved to database
4. Dashboard displays current progress across all modules

### Communication Flow
1. Students can send messages to admin
2. Messages are stored with 'unread' status
3. Admin can view and mark messages as 'read'
4. System can send email notifications for important events

## ASCII ER Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    Students     │       │    Modules      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ full_name       │       │ module_name     │
│ email (UQ)      │       │ description     │
│ phone_number    │       │ access_type     │
│ gmail_uid (UQ)  │       │ created_at      │
│ status          │       │ updated_at      │
│ is_admin        │       └─────────────────┘
│ created_at      │               │
│ updated_at      │               │
└─────────────────┘               │
        │                        │
        │ 1                    1 │
        │                        │
        ▼                        ▼
┌─────────────────┐       ┌─────────────────┐
│ Access Requests │       │    Progress     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ student_id (FK) │◄──────┤ student_id (FK) │
│ module_id (FK)  │──────►│ module_id (FK)  │
│ status          │       │ progress_status │
│ admin_comment   │       │ percentage_comp │
│ created_at      │       │ last_updated    │
│ updated_at      │       └─────────────────┘
│ (UQ: s_id,m_id) │
└─────────────────┘
        ▲
        │ 1
        │
        ▼
┌─────────────────┐
│   Messages      │
├─────────────────┤
│ id (PK)         │
│ student_id (FK) │
│ message_content │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Key Business Rules

1. **Module 1 is always open** - access_type = 'open'
2. **Modules 2-7 require approval** - access_type = 'requires_approval'
3. **Students can only access approved modules**
4. **One access request per student-module pair**
5. **Progress is tracked per student-module combination**
6. **Admin emails are configured via environment variables**
7. **Session timeout after 24 hours of inactivity**
8. **All foreign keys cascade delete for data integrity**
