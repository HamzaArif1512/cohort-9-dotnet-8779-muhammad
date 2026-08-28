Design and implement the Admin Task Directory screen for the Task Management application.

IMPORTANT:
The existing `design.md` file is the PRIMARY visual specification. The Regular User Task Directory and both dashboard screens have already established the application's visual language.

This Admin Task Directory must feel like the natural administrative extension of the existing Task Directory.

Reuse exactly:

- Application shell
- Sidebar
- Header
- Typography
- Color palette
- Spacing
- Borders
- Radius
- Shadows
- Buttons
- Toasts
- Loading states
- Empty states
- Error states
- Hover animations
- List/Card toggle
- Filter interaction patterns
- Responsive behavior

Do NOT create a separate admin visual theme.

==================================================
SCREEN
==================================================

Route:

/tasks

This is the Administrator version of the Task Directory.

The Administrator should be able to:

- View ALL tasks across the system.
- Search tasks.
- Filter tasks.
- Toggle between List/Table and Card views.
- View task details.
- Create tasks.
- Edit any task.
- Delete any task.
- Change any task property.

Unlike Regular Users, Administrators have full task-management authority.

==================================================
BACKEND OPERATIONS
==================================================

The existing backend supports:

Create:

POST /tasks

Retrieve all:

GET /tasks

Retrieve one:

GET /tasks/{id}

Update:

PUT /tasks/{id}

Search/filter:

GET /tasks/search

Delete:

DELETE /tasks/{id}

The frontend should conceptually connect these operations through a task service.

Do not invent additional endpoints.

==================================================
TASK DATA
==================================================

Tasks contain information including:

- Id
- Title
- Description
- Status
- Priority
- Category
- Assignee/User
- DueDate
- CreatedAt
- UpdatedAt

IMPORTANT ADMIN-SPECIFIC REQUIREMENT:

The Administrator must be able to see the name of the user to whom each task is assigned.

The table should therefore include:

- Task
- Assignee
- Status
- Priority
- Category
- Due Date
- Updated

Do not hide the assignee information in a secondary interaction.

==================================================
PAGE HEADER
==================================================

Reuse the existing Task Directory header style.

Title:

"Tasks"

Supporting text:

"Manage tasks across the entire system."

The administrator should immediately understand that this is the system-wide task directory.

Header actions:

[ Search ] [ Filters ] [ List | Cards ] [ + Create Task ]

The Create Task button should use the application's primary purple style.

Do NOT place Delete or Edit actions in the header.

==================================================
SEARCH
==================================================

Reuse the Regular User Task Directory search component.

Search should conceptually connect to:

GET /tasks/search

Use the existing backend-supported search/filter fields.

The search field should include:

- Search icon.
- Clear action.
- Focus state.
- Loading state.
- Pointer cursor where appropriate.

Do not add search fields that the backend does not support.

==================================================
FILTERS
==================================================

Reuse the existing premium filter interaction from the Regular User Task Directory.

Use:

[ Filters ]

rather than exposing a large collection of filters directly on the page.

Clicking it opens a modal/drawer containing the available TaskSearchDto filters.

Potential categories, only where supported by the backend:

### Status

- Pending
- In Progress
- Completed

### Priority

- Low
- Medium
- High

### Category

Available categories.

### Assignee

This is especially important for Administrators.

Allow filtering tasks by assigned user if supported by the existing backend search contract.

### Due Date

Use the existing supported date/range filtering.

The filter modal should remain clean and organized.

Bottom actions:

[ Clear all ] [ Apply filters ]

After applying:

- Show active filter count.
- Optionally show removable filter chips.
- Preserve filters when switching List ↔ Cards.

==================================================
LIST / TABLE VIEW
==================================================

List view should be the default.

Create a professional administrative task table.

Recommended columns:

| Task | Assignee | Status | Priority | Category | Due Date | Updated | Actions |

The Task column should contain:

- Task title.
- Optional short description preview.

Assignee should display:

- User name.
- Optional compact avatar/initials if consistent with the established design.

Do NOT introduce profile-photo requirements.

Status:

Compact status badge.

Priority:

Compact priority badge.

Category:

Compact category badge/text.

Due Date:

Readable date.

Updated:

Readable relative or formatted date.

Actions:

Use a compact action menu rather than filling the table with multiple large buttons.

Example:

[ ⋮ ]

Menu:

- View
- Edit
- Delete

The table should remain visually clean.

==================================================
ADMIN ACTION MENU
==================================================

Each task row should have an action menu.

Menu options:

View task
Edit task
Delete task

Use clear icons and labels.

The menu must:

- Have a white surface.
- Subtle border.
- Soft shadow.
- Proper alignment.
- Pointer cursor.
- Hover states.
- Keyboard accessibility.

Delete should be visually distinct but restrained.

==================================================
CARD VIEW
==================================================

Reuse the Regular User card view concept but add administrative information/actions.

Each card should show:

- Task title
- Assignee
- Status
- Priority
- Category
- Due date
- Updated date

Include a compact action menu:

[ ⋮ ]

Options:

- View
- Edit
- Delete

The card itself should remain clickable for viewing details.

Avoid placing several large buttons inside every card.

Cards should have:

- Pointer cursor.
- Subtle border transition.
- Slight elevation on hover.
- 150–250ms transition.

==================================================
CREATE TASK
==================================================

Administrators can create tasks.

IMPORTANT:
Do NOT navigate to a separate `/tasks/new` page.

Use a modal.

Clicking:

[ + Create Task ]

opens a polished Create Task modal.

The modal should contain:

### Title

Text input.

### Description

Multiline text area.

### Assignee

Dropdown/select containing users.

### Priority

Selector:

- Low
- Medium
- High

### Category

Category picker.

### Due Date

Date picker.

Status should NOT be selected during creation.

The backend automatically initializes new tasks as:

Pending

Therefore the UI should not ask the administrator to choose the initial status.

Modal actions:

[ Cancel ] [ Create Task ]

Create Task should be the primary purple action.

==================================================
CREATE MODAL UX
==================================================

The modal should:

- Have clear title: "Create Task"
- Use logical field grouping.
- Have consistent input styling.
- Show validation errors inline.
- Disable duplicate submission.
- Show a loading state while creating.
- Preserve modal dimensions while loading.
- Close after successful creation.
- Refresh/update the task list.
- Show a success toast.

Success toast:

"Task created successfully"

Error toast:

"Unable to create task"

Do not expose raw backend exceptions.

==================================================
EDIT TASK
==================================================

Administrators can modify ANY task property.

Do NOT navigate to `/tasks/:id/edit`.

Use an Edit Task modal.

Open via:

- Row action menu → Edit
- Card action menu → Edit

The modal should contain:

### Title

Editable.

### Description

Editable.

### Assignee

Editable dropdown.

### Status

Editable selector:

- Pending
- In Progress
- Completed

### Priority

Editable:

- Low
- Medium
- High

### Category

Editable.

### Due Date

Editable date picker.

Actions:

[ Cancel ] [ Save Changes ]

Primary action:

Save Changes

==================================================
EDIT MODAL UX
==================================================

Use the same form components as Create Task wherever possible.

The Edit modal should:

- Pre-populate all existing values.
- Show validation errors.
- Show loading state during update.
- Prevent duplicate submissions.
- Close after successful update.
- Update the affected row/card.
- Show a success toast.

Success:

"Task updated successfully"

Failure:

"Unable to update task"

Do not create separate styling for Create and Edit modals.

Use a reusable TaskForm component conceptually.

==================================================
DELETE TASK
==================================================

Deleting a task is destructive.

Do NOT delete immediately when the administrator clicks Delete.

Open a confirmation dialog.

Example:

"Delete task?"

"Are you sure you want to delete 'Implement JWT authentication'? This action cannot be undone."

Actions:

[ Cancel ] [ Delete Task ]

Delete Task should use a restrained destructive red treatment.

While deletion is processing:

[ Deleting... ]

After success:

"Task deleted successfully"

After failure:

"Unable to delete task"

The table/card should update without requiring a full page reload where possible.

==================================================
TASK DETAIL
==================================================

Clicking a task or selecting View should navigate to:

/tasks/:id

The Task Directory should not attempt to duplicate the full task detail UI.

Only provide the navigation entry point.

==================================================
STATUS AND PRIORITY
==================================================

Use the application's existing status and priority visual language.

Statuses:

Pending
In Progress
Completed

Priorities:

Low
Medium
High

Do not introduce new statuses.

Do not use color alone to communicate state.

==================================================
PAGINATION
==================================================

The task directory should support pagination if the backend response provides paginated results.

Use the existing pagination design from the Regular User Task Directory.

Example:

Showing 1–10 of 85 tasks

[ Previous ] 1 2 3 ... [ Next ]

Loading a new page should not blank the entire screen.

==================================================
LOADING STATES
==================================================

Create loading states for:

- Initial task retrieval.
- Search.
- Filtering.
- Pagination.
- Create Task.
- Update Task.
- Delete Task.

Table:

Use skeleton rows.

Cards:

Use skeleton cards.

Buttons:

Use inline spinners/loading labels.

Never leave the user uncertain whether an operation is processing.

==================================================
EMPTY STATES
==================================================

Handle:

### No tasks

"No tasks available"

"There are currently no tasks in the system."

Provide:

[ Create Task ]

because Administrators are allowed to create tasks.

### No search results

"No matching tasks"

"Try adjusting your search or filters."

### No filtered results

"No tasks match these filters"

"Try removing one or more filters."

==================================================
ERROR STATE
==================================================

If task retrieval fails:

"Unable to load tasks"

"Something went wrong while retrieving system tasks."

[ Retry ]

Follow the same error design as the existing application.

==================================================
WHITESPACE
==================================================

The Admin Task Directory should be information-dense without becoming cluttered.

Use the entire content width intelligently.

Desktop table:

- Full-width.
- Comfortable row spacing.
- Columns aligned consistently.

Card view:

- 3–4 cards per row depending on viewport.

Do not create giant empty regions.

Do not add decorative widgets merely to fill space.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop:

- Compact sidebar.
- Search/filter/view controls in one toolbar.
- Full-width table.
- Multi-column card grid.
- Modal forms centered appropriately.

Tablet:

- Toolbar wraps naturally.
- Table remains usable.
- Cards reduce to 2 columns.

Mobile:

- Search full width.
- Controls wrap.
- Table can horizontally scroll OR use a compact responsive representation.
- Cards become one column.
- Create/Edit modal becomes a full-screen or near-full-screen form.
- Filter modal becomes a full-height sheet.

No horizontal page overflow.

==================================================
COMPONENT ARCHITECTURE
==================================================

Reuse components from the Regular User Task Directory.

Suggested structure:

AdminTaskDirectory
├── TaskPageHeader
├── TaskToolbar
│   ├── TaskSearchBar
│   ├── FiltersButton
│   └── ViewToggle
├── ActiveFilterChips
├── TaskListView
│   └── AdminTaskTable
├── TaskCardView
│   └── AdminTaskCard
├── TaskActionMenu
├── FilterModal
├── CreateTaskModal
│   └── TaskForm
├── EditTaskModal
│   └── TaskForm
├── DeleteTaskDialog
├── Pagination
└── TaskListSkeleton

Prefer reusable components and variants rather than duplicated implementations.

The Create and Edit modals should share the same TaskForm structure.

==================================================
BACKEND INTEGRATION ARCHITECTURE
==================================================

Conceptually:

AdminTaskDirectory
        ↓
useTasks / task state
        ↓
taskService
        ↓
API client
        ↓
ASP.NET Core API

Service methods should conceptually include:

taskService.getTasks()
taskService.searchTasks()
taskService.getTask()
taskService.createTask()
taskService.updateTask()
taskService.deleteTask()

Do not put raw API calls inside:

- TaskTable
- TaskCard
- TaskActionMenu
- TaskForm

Keep data fetching and UI presentation separate.

==================================================
STATE MANAGEMENT
==================================================

The page should conceptually maintain separate state for:

- Task data
- Search query
- Active filters
- Pagination
- View mode
- Loading state
- Error state
- Create modal state
- Edit modal state
- Delete confirmation state
- Currently selected task

Switching List ↔ Cards should NOT trigger unnecessary API requests.

Search/filter changes should update the backend query appropriately.

==================================================
VISUAL STYLE
==================================================

Follow design.md exactly.

Primary:

#7F40E4

Secondary:

#FFC000

Base:

White / near-white.

Text:

Black/dark gray.

Typography:

Archivo:
- Headings
- Task titles
- Table headers
- Buttons
- Labels

Jost:
- Body text
- Descriptions
- Supporting information

Do not introduce new fonts or a separate admin palette.

==================================================
INTERACTION QUALITY
==================================================

All interactive elements must have:

- cursor: pointer
- Hover state
- Focus state
- Active state where relevant
- Disabled state
- Loading state where applicable

Use subtle 150–250ms transitions.

Examples:

Task row hover:
- Slight background change.

Card hover:
- Border/shadow transition.
- Tiny upward movement.

Buttons:
- Subtle color/elevation change.

View toggle:
- Smooth active indicator.

Do not use excessive animations.

Respect reduced-motion preferences.

==================================================
IMPORTANT ADMIN VS REGULAR USER DIFFERENCE
==================================================

The Regular User Task Directory is read/manage-status only.

The Admin Task Directory is full task management.

Regular User:

VIEW
SEARCH
FILTER
CHANGE STATUS

Admin:

VIEW
SEARCH
FILTER
CREATE
EDIT ALL FIELDS
DELETE
CHANGE STATUS
VIEW ASSIGNEE

Make this difference visually obvious without making the Admin interface feel cluttered.

==================================================
FINAL QUALITY BAR
==================================================

The finished Admin Task Directory should feel like the administrative counterpart to the existing Regular User Task Directory.

It should communicate:

"An administrator has complete control over the system's tasks."

The interface should feel:

- Professional.
- Minimalistic.
- Information-rich.
- Efficient.
- Enterprise-ready.
- Easy to scan.
- Consistent with the Dashboard and Regular User Task Directory.

Avoid:

- Generic CRUD admin templates.
- Huge forms.
- Excessive action buttons.
- Large empty spaces.
- Overly colorful tables.
- Separate pages for Create/Edit when a modal is more efficient.
- Unnecessary charts.
- Fake functionality.

The final design should be implementation-friendly and ready to connect directly to the existing ASP.NET Core endpoints.