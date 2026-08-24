```text
Design and implement the Admin User Management page for the Task Management application.

IMPORTANT:
Follow the existing `design.md` file and the visual language already established across the Regular User/Admin Dashboards and Task Directory.

Reuse the same:
- Application shell and sidebar
- Header
- Typography
- #7F40E4 / #FFC000 color system
- Spacing
- Borders, radius, and shadows
- List/Card toggle
- Modal styling
- Toast notifications
- Loading, empty, and error states
- Hover/focus animations
- Responsive behavior

Do NOT create a separate visual style for this page.

==================================================
PURPOSE
==================================================

This is an Administrator-only User Management page.

Route:

/users

The administrator should be able to:

1. View all Regular Users.
2. Toggle between List/Table and Card views.
3. Click a user to inspect their details.
4. View all tasks assigned to that user, regardless of status.
5. Register a new Regular User.

Administrators should NOT be able to modify existing user information from this page because no update-user endpoint exists.

Do NOT add:
- Edit user
- Delete user
- Deactivate user
- Change role

unless a corresponding backend endpoint is later implemented.

==================================================
BACKEND OPERATIONS
==================================================

Existing backend functionality:

GET /admin/users
→ Retrieves all Regular Users.

GET /admin/users/{userId}
→ Retrieves details for a specific Regular User.

GET /admin/users/{userId}/tasks
→ Retrieves all tasks assigned to that user regardless of status.

POST /admin/users
→ Creates a new Regular User.

Conceptually structure the frontend as:

UserManagement
      ↓
useUsers
      ↓
adminUserService
      ↓
API client
      ↓
ASP.NET Core API

Do not put API requests directly inside table rows, cards, or modals.

==================================================
PAGE HEADER
==================================================

Header:

"User Management"

Supporting text:

"Manage regular users and review their assigned workload."

On the right:

[ List | Cards ] [ + Add User ]

The Add User button should use the primary purple button style.

==================================================
USER LIST VIEW
==================================================

Default view should be List/Table.

Display all Regular Users.

Recommended columns:

- User
- Email
- Tasks
- Joined

Example:

┌─────────────────────────────────────────────────────────┐
│ User             Email                 Tasks     Joined  │
├─────────────────────────────────────────────────────────┤
│ Hamza Arif       hamza@example.com       8      Aug 12 │
│ Sarah Ahmed      sarah@example.com       14     Aug 08 │
│ Ali Khan         ali@example.com          3     Jul 29 │
└─────────────────────────────────────────────────────────┘

Use the backend's:

AdminUserListDto

which contains:

- Id
- Name
- Email
- CreatedAt
- TaskCount

The TaskCount should be visually useful but not overpower the user's identity.

The entire row should be clickable.

Use:

cursor: pointer;

Hover:

- Subtle background transition.
- Slight border/background emphasis.

Clicking a row opens the User Details modal.

Do NOT add an action menu with Edit/Delete because those operations are not currently supported.

==================================================
CARD VIEW
==================================================

Provide the same List/Card toggle used by the Task Directory.

Cards should display:

- User name
- Email
- Task count
- Joined date

Example:

┌──────────────────────────────┐
│ Hamza Arif                   │
│ hamza@example.com            │
│                              │
│ 8 tasks                      │
│ Member since Aug 12, 2026    │
└──────────────────────────────┘

Cards should be clickable.

Hover:

- Subtle elevation.
- Border transition.
- Tiny upward movement.
- 150–250ms transition.

Do not introduce profile photos.

Use initials only if an avatar-like visual is useful and consistent with the existing design system.

==================================================
USER DETAILS MODAL
==================================================

Clicking a user opens a User Details modal.

Do NOT navigate to a separate user-details page.

The modal should retrieve:

GET /admin/users/{userId}

and:

GET /admin/users/{userId}/tasks

The modal should present the user's information and workload together.

==================================================
USER INFORMATION
==================================================

At the top of the modal display:

Name
Email

Use a clear hierarchy.

Example:

Hamza Arif
hamza@example.com

Do not display:

- Password
- Password hash
- User ID
- Internal database fields

Do not show a profile photo.

==================================================
USER TASKS
==================================================

Below the user's information, display ALL tasks assigned to that user.

IMPORTANT:

Show tasks regardless of status.

Do NOT automatically filter to:

- Pending only
- Active only
- Completed only

The administrator should see the complete task history returned by the backend.

Use a compact task list/table inside the modal.

Recommended columns:

- Task
- Status
- Priority
- Category
- Due Date

Example:

Task                     Status       Priority    Due
────────────────────────────────────────────────────────
Implement authentication In Progress  High        Aug 23
Write unit tests         Completed    Medium      Aug 20
API documentation        Pending      Low         Aug 27

Reuse the existing Task status/priority visual language.

==================================================
TASK LIST INSIDE MODAL
==================================================

The task list should remain compact.

Do not create a giant table that overwhelms the modal.

If the user has many tasks:

- Allow the task section to scroll independently.
- Keep the user's name/email header visible where appropriate.
- Avoid making the entire page scroll.

Each task can be clickable and conceptually navigate to:

/tasks/:id

This allows the administrator to inspect the full task.

Do not add editing controls inside this modal unless they already exist in the established Admin Task Directory interaction.

==================================================
NO TASKS STATE
==================================================

If the selected user has no tasks:

"No tasks assigned"

"This user currently has no tasks assigned."

Keep this state compact.

Do not make it visually dramatic.

==================================================
USER DETAILS LOADING
==================================================

When opening a user:

Do NOT immediately show a blank modal.

Show skeleton loading states for:

- Name
- Email
- Task rows

The modal should remain stable while the data loads.

If the user details request succeeds but task retrieval is still loading, allow the user information to appear while the task section continues loading.

==================================================
USER DETAILS ERROR
==================================================

If loading fails:

"Unable to load user details"

"Something went wrong while retrieving this user's information."

[ Retry ]

Use the application's existing error styling.

==================================================
ADD USER
==================================================

Administrators can register a new Regular User.

Clicking:

[ + Add User ]

opens a modal.

Do NOT navigate to a separate registration page.

Modal title:

"Add User"

Supporting text:

"Create a new regular user account."

==================================================
ADD USER FORM
==================================================

The form must contain exactly:

### Full Name

Text input.

### Email

Email input.

### Password

Password input.

IMPORTANT:

The password field MUST include an eye icon to toggle:

- Hidden password
- Visible password

The eye button must have:

- Pointer cursor.
- Accessible label.
- Clear hover state.
- Focus state.

Example:

Password             [••••••••] [◉]

Clicking the eye changes:

Password             [MyPassword] [◉]

Do not expose the password by default.

==================================================
PASSWORD VALIDATION
==================================================

The password validation rules should match the existing authentication registration flow.

Do not create weaker Admin User registration rules.

The same password requirements used by the existing `/auth/register` functionality should apply here, including requirements such as:

- Minimum password length.
- Uppercase character.
- Lowercase character.
- Number.
- Special character.

Use the application's actual existing validation rules rather than inventing different requirements.

Display validation feedback clearly beneath the password field.

Do not display password requirements in an overwhelming way.

A compact requirement list/checklist is acceptable.

==================================================
ADD USER ACTIONS
==================================================

Modal footer:

[ Cancel ] [ Create User ]

Create User is the primary purple action.

While submitting:

[ Creating... ]

Disable duplicate submission.

After successful creation:

- Close the modal.
- Refresh the user list.
- Show success toast.

Success:

"User created successfully"

Failure:

"Unable to create user"

Do not expose raw backend exceptions.

==================================================
EMAIL DUPLICATE ERROR
==================================================

The backend explicitly checks whether the email already exists.

If the API returns an existing-email error, display an inline/form-level message:

"A user with this email already exists."

Do not show a generic error when a specific validation message is available.

==================================================
FORM VALIDATION
==================================================

Validate:

Full Name
- Required.

Email
- Required.
- Valid email format.

Password
- Required.
- Must satisfy the same password rules as authentication registration.

Show validation errors inline.

Do not rely exclusively on toast messages for form validation.

==================================================
TOASTS
==================================================

Reuse the application's centralized toast system.

Examples:

Success:
"User created successfully"

Error:
"Unable to create user"

Do not introduce a new notification component.

==================================================
SEARCH
==================================================

Do not invent a server-side user search endpoint because one has not been provided.

If the complete user list is already retrieved, a client-side search field may be included.

If implemented, keep it simple:

[ 🔍 Search users... ]

Search by:

- Name
- Email

The search should filter the currently loaded user collection.

Do not pretend it is an API-backed search operation.

==================================================
LIST / CARD TOGGLE
==================================================

Reuse the application's existing segmented List/Card control.

Default:

List

Switching views should:

- Preserve search state.
- Preserve the currently loaded users.
- Not trigger an unnecessary API request.
- Animate smoothly.

Use the same fluid toggle animation established elsewhere in the application.

==================================================
WHITESPACE
==================================================

Avoid excessive whitespace.

The page should use the available content width intelligently.

List view should use a full-width table.

Card view should use:

Desktop:
3–4 cards per row.

Tablet:
2 cards per row.

Mobile:
1 card per row.

Do not create unnecessarily tall cards.

The page should feel balanced rather than empty.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop:

- Existing application sidebar.
- Header with List/Card toggle and Add User.
- Full-width user table.
- Centered User Details modal.
- Centered Add User modal.

Tablet:

- Toolbar wraps naturally.
- Table remains readable.
- Cards reduce to two columns.

Mobile:

- Header stacks naturally.
- Add User remains easy to access.
- Cards become single-column.
- User Details modal becomes a full-screen/near-full-screen sheet.
- Add User modal becomes a full-screen/near-full-screen form.
- Task list inside User Details remains independently scrollable.

No horizontal page overflow.

==================================================
COMPONENT ARCHITECTURE
==================================================

Use reusable components.

Suggested structure:

UserManagement
├── UserPageHeader
├── UserToolbar
│   ├── UserSearch
│   └── ViewToggle
├── UserListView
│   └── UserTable
├── UserCardView
│   └── UserCard
├── UserDetailsModal
│   ├── UserInformation
│   └── UserTaskList
├── AddUserModal
│   └── AddUserForm
├── PasswordInput
├── UserListSkeleton
└── EmptyUserState

Do not duplicate the PasswordInput or List/Card toggle components if equivalent components already exist elsewhere.

==================================================
BACKEND INTEGRATION
==================================================

Conceptual service methods:

adminUserService.getUsers()
adminUserService.getUser(userId)
adminUserService.getUserTasks(userId)
adminUserService.createUser(payload)

Keep API communication outside presentation components.

The Create User payload should conceptually contain:

{
    name,
    email,
    password
}

The response should map to:

AdminUserListDto

The user details response should map to:

AdminUserDetailsDto

The task collection should map to:

AdminUserTaskDto

Do not expose internal DTO implementation details directly in the visual UI.

==================================================
LOADING AND ERROR STATES
==================================================

Design loading states for:

- Initial user list.
- User search/filtering.
- User details modal.
- User task list.
- Create user submission.

Use skeletons and inline loading indicators rather than full-screen spinners.

==================================================
ACCESSIBILITY
==================================================

Ensure:

- Keyboard-accessible table rows.
- Keyboard-accessible cards.
- Accessible modal focus management.
- Escape closes modals.
- Proper labels for all form inputs.
- Accessible password visibility toggle.
- Visible focus states.
- Screen-reader-friendly status information.
- Do not rely solely on color.

==================================================
FINAL QUALITY BAR
==================================================

The page should feel like a polished continuation of the existing Task Management application.

The administrator should be able to quickly answer:

"Who are my regular users?"

"How many tasks does each user have?"

"What tasks belong to this user?"

"Can I quickly register another user?"

The page should be:

- Professional.
- Minimalistic.
- Information-rich.
- Easy to scan.
- Efficient.
- Responsive.
- Backend-integration ready.

Avoid:

- Profile-photo-heavy layouts.
- Generic admin templates.
- Excessive empty space.
- Unnecessary user-management actions.
- Separate detail pages when a modal is more efficient.
- Showing passwords anywhere except the controlled password input.
- Inventing user-edit/deactivation functionality.

Follow `design.md` as the authoritative visual source of truth.
```
