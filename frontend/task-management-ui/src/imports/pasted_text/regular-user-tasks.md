Absolutely. Since the dashboard prompt already establishes the visual language, this prompt should tell Figma Make to **reuse that exact system** rather than redesigning the task page independently.

```text
Implement the Regular User Task Directory screen for my Task Management application.

IMPORTANT:
The previously provided design.md file is the PRIMARY visual specification for the entire application.

The Regular User Dashboard has already been designed using the same design system. This Task Directory must feel like a direct continuation of that dashboard — same application shell, sidebar, header, typography, colors, spacing, borders, radius, shadows, interaction patterns, loading states, toast system, and responsive behavior.

Do NOT introduce a new visual style.

Focus ONLY on the Regular User Task Directory. Do not implement the task detail or task editor screens yet.

==================================================
SCREEN
==================================================

Route:

/tasks

Purpose:

Allow a Regular User to:

- View all of their own tasks.
- Search their tasks.
- Filter their tasks.
- Toggle between table/list view and card view.
- Open a task to view its details.
- Understand task status, priority, category, assignee, and due date at a glance.

IMPORTANT PERMISSIONS:

Regular users CANNOT:

- Create tasks.
- Delete tasks.
- Change task title.
- Change task description.
- Change assignee.
- Change priority.
- Change category.
- Change due date.

Regular users CAN:

- View their tasks.
- View detailed task information.
- Update ONLY the task status.

Allowed status transitions:

Pending
→ In Progress
→ Completed

The status should initially be Pending when a task is created by an authorized user.

Do NOT show Create Task buttons, Delete buttons, or general Edit Task actions anywhere in this Regular User interface.

==================================================
AVAILABLE BACKEND OPERATIONS
==================================================

The screen will eventually integrate with these existing backend operations.

Retrieve/search tasks:

GET /tasks

GET /tasks/search

Retrieve a specific task:

GET /tasks/{id}

Update task:

PUT /tasks/{id}

The backend already handles Regular User authorization and filtering.

The frontend should NOT attempt to reproduce authorization rules locally beyond controlling which UI actions are exposed.

==================================================
TASK DATA
==================================================

The task records contain information conceptually including:

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

Use realistic mock data for the Figma prototype, but structure the mock data so it can easily be replaced with the actual API response later.

Do not invent functionality that requires a backend endpoint that does not exist.

==================================================
PAGE HEADER
==================================================

Reuse the same header style established on the Dashboard.

Header:

Tasks

Supporting text:

"View and manage the status of your assigned tasks."

Keep the header compact.

On the right side, provide useful task-directory controls.

Suggested:

[ Search tasks... ] [ Filters ] [ List | Cards ]

Do NOT add:

[ + Create Task ]

because Regular Users cannot create tasks.

==================================================
SEARCH
==================================================

Provide a prominent but compact task search field.

Example:

┌──────────────────────────────────────────────┐
│ 🔍 Search tasks...                           │
└──────────────────────────────────────────────┘

The search should conceptually connect to:

GET /tasks/search

The visual design should support searching by the backend's available keyword/search functionality.

Do not add unnecessary search fields that the backend does not support.

Search should have:

- Clear focus state.
- Purple focus border/ring.
- Search icon.
- Clear button when text exists.
- Loading state while searching.
- Empty result state.

Use a subtle debounce conceptually rather than triggering a request for every keystroke.

==================================================
FILTERS BUTTON
==================================================

Instead of displaying a large row of filters directly above the table, use a single:

[ Filters ]

button.

This is intentionally inspired by the clean filtering interaction found in marketplaces such as Chrono24.

The button should display an active-filter indicator when filters are applied.

Example:

[ Filters • 3 ]

or

[ Filters ] ●

The button should have:

- Filter icon.
- Pointer cursor.
- Subtle hover animation.
- Clear active state.

==================================================
FILTER MODAL
==================================================

Clicking Filters should open a polished modal/drawer containing all available task filters.

The modal should feel similar to a premium marketplace filter interface rather than a generic admin form.

Desktop:

Use a centered or right-side filter panel depending on what fits the existing application shell best.

Mobile:

Use a full-height bottom sheet or full-screen filter panel.

The filter interface should contain clearly separated categories.

Potential categories based on the existing TaskSearchDto/backend search functionality:

### Status

- Pending
- In Progress
- Completed

Allow selecting one or multiple statuses if the backend supports it.

### Priority

- Low
- Medium
- High

### Category

Display available task categories.

### Due Date

Provide a clean date/range selection UI if supported by the backend.

For example:

- Any time
- Due soon
- Custom date range

Do NOT expose filters that are not supported by the existing backend DTO.

The exact available filter fields should map to the existing TaskSearchDto.

==================================================
FILTER MODAL UX
==================================================

The modal should have:

Header:

"Filters"

A clear close button.

Filter categories separated by subtle dividers.

Bottom action area:

[ Clear all ]              [ Apply filters ]

"Apply filters" should use the primary purple button style.

"Clear all" should be a secondary action.

When filters are applied:

- Close the modal.
- Update the task results.
- Show active filter count on the Filters button.
- Preserve the selected filters while navigating between list/card views.

Do not immediately close the modal whenever a checkbox/radio option is selected.

Let the user configure several filters and then explicitly press Apply.

==================================================
ACTIVE FILTER DISPLAY
==================================================

After applying filters, optionally show compact filter chips below the header/search area.

Example:

[ Status: In Progress × ]
[ Priority: High × ]
[ Category: Development × ]

These chips should be removable individually.

Also provide:

[ Clear all ]

Keep this area compact.

If no filters are active, do not reserve unnecessary space for it.

==================================================
LIST / TABLE VIEW
==================================================

The default view should be the List/Table view.

Create a professional task table.

Columns:

- Task
- Status
- Priority
- Category
- Due Date
- Updated

Avoid unnecessary columns.

The table should make the Task title visually dominant.

Example:

┌──────────────────────────────────────────────────────────┐
│ Task             Status       Priority   Category  Due   │
├──────────────────────────────────────────────────────────┤
│ Implement JWT     ● Pending   High       Auth      Aug 22│
│ Write tests       ● Progress  Medium     Testing   Aug 24│
│ API documentation ● Complete  Low        Docs      Aug 25│
└──────────────────────────────────────────────────────────┘

Rows should have:

- Subtle separators.
- Comfortable but compact height.
- Hover background.
- Pointer cursor because rows are clickable.
- Smooth hover transition.
- Clear clickable task title.

Clicking a row should conceptually navigate to:

/tasks/:id

Do not put Edit/Delete actions in the table.

==================================================
CARD VIEW
==================================================

The user can switch to a Card view.

Use the same task information but organize it into clean task cards.

Example:

┌───────────────────────────────┐
│ HIGH                          │
│                               │
│ Implement JWT authentication  │
│                               │
│ Development                   │
│                               │
│ Due Aug 22                    │
│                               │
│ ● In Progress                 │
└───────────────────────────────┘

Cards should show:

- Title
- Status
- Priority
- Category
- Due date
- Relevant metadata

Do not overload the cards with every backend property.

Clicking a card opens:

/tasks/:id

Cards should have:

- Pointer cursor.
- Subtle hover elevation.
- Border transition.
- Tiny translateY movement.
- Smooth 150–250ms animation.

==================================================
VIEW TOGGLE
==================================================

Reuse the List/Card toggle from the application's design system.

Use a compact segmented control:

[ ☷ List | ▦ Cards ]

List should be selected by default.

When switching:

- Preserve search.
- Preserve active filters.
- Preserve pagination where appropriate.
- Animate the transition smoothly.
- Do not reload unnecessary data simply because the visual representation changed.

Use a subtle opacity/transform transition.

==================================================
STATUS INTERACTION
==================================================

Regular users are allowed to change ONLY task status.

This interaction should be obvious but controlled.

Do not show a generic "Edit" button.

Instead, provide a status control where appropriate.

Example:

[ ● Pending ▼ ]

Clicking it opens:

Pending
In Progress
Completed

The user can update the status.

The backend operation is:

PUT /tasks/{id}

The frontend should conceptually send only the status change in Regular User mode.

Do NOT expose fields such as:

Title
Description
Assignee
Priority
Category
Due Date

as editable fields.

The UI should make it visually obvious that the rest of the task is read-only.

==================================================
STATUS STATES
==================================================

Use the application's established status colors.

Pending:
Neutral / subtle warning treatment.

In Progress:
Primary purple treatment.

Completed:
Success treatment.

Do not use oversized badges.

Use compact status indicators.

Always include text in addition to color so status is understandable without color perception.

==================================================
TASK CLICKABILITY
==================================================

Every task row/card should be clearly clickable.

Use:

cursor: pointer;

Hover should subtly communicate:

"This opens task details."

Do not make the entire UI excessively animated.

==================================================
PAGINATION
==================================================

The backend supports paginated task retrieval.

Design pagination at the bottom of the task directory.

Example:

Showing 1–10 of 42 tasks

[ Previous ] 1 2 3 4 [ Next ]

Use a compact pagination component.

Disable Previous on the first page.

Disable Next on the last page.

Loading a new page should not make the entire page disappear.

Prefer subtle table/card skeleton replacement.

==================================================
LOADING STATE
==================================================

Create complete loading states.

For table view:

Show skeleton rows matching:

Task
Status
Priority
Category
Due Date
Updated

For card view:

Show skeleton cards matching the final card dimensions.

For search/filter:

Use a subtle inline loading state.

Do not replace the entire page with a giant spinner.

==================================================
EMPTY STATE
==================================================

There are multiple possible empty states.

### No tasks

Display:

"No tasks assigned"

"You don't currently have any tasks assigned to you."

Do not show a Create Task button because Regular Users cannot create tasks.

### No search results

Display:

"No matching tasks"

"Try adjusting your search or filters."

Provide:

[ Clear Filters ]

where appropriate.

### No results after filtering

Display:

"No tasks match these filters"

"Try removing one or more filters."

Use a compact professional empty state.

Do not use cartoon illustrations.

==================================================
ERROR STATE
==================================================

If task retrieval fails:

"Unable to load tasks"

"Something went wrong while retrieving your tasks."

[ Retry ]

Use the application's established error styling.

==================================================
DELETE / CREATE RESTRICTIONS
==================================================

IMPORTANT:

Do NOT display:

- Create Task button
- Delete button
- Delete menu item
- Create Task modal
- General Edit button
- Edit icon

Regular users must only be able to:

1. View their tasks.
2. Search/filter their tasks.
3. Open task details.
4. Change task status.

The interface should enforce this visually.

==================================================
TOASTS
==================================================

Use the centralized toast system established by design.md.

After a successful status update:

"Task status updated successfully"

On failure:

"Unable to update task status"

Toasts should appear consistently in the same location as the Dashboard.

Do not create a new notification style.

==================================================
VISUAL STYLE
==================================================

Follow design.md and the previously implemented Dashboard exactly.

Primary:

#7F40E4

Secondary:

#FFC000

Background:

Near-white.

Surfaces:

White.

Text:

Dark/black.

Borders:

Subtle gray.

Typography:

Archivo:
- Page title
- Table headers
- Task titles
- Buttons
- Status labels
- Important UI

Jost:
- Descriptions
- Supporting information
- Secondary text

Do not introduce additional fonts.

==================================================
DENSITY AND WHITESPACE
==================================================

The Task Directory should be information-rich.

Do not create giant empty spaces.

The task table should use the available width.

Card view should use a responsive grid that fills the content area naturally.

Example:

Desktop:

3–4 cards per row depending on available width.

Tablet:

2 cards per row.

Mobile:

1 card per row.

Do not artificially increase card height just to fill space.

For table view, use the full content width.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop:

- Compact sidebar from the established application shell.
- Search and controls aligned horizontally.
- Full-width task table.
- Filter modal/drawer.
- Multi-column card grid.

Tablet:

- Controls wrap naturally.
- Table remains usable.
- Cards reduce columns.

Mobile:

- Header stacks naturally.
- Search occupies full width.
- Filters and view toggle remain accessible.
- Table may become horizontally scrollable OR use a compact mobile task representation.
- Cards become single-column.
- Filter interface becomes a full-screen/bottom-sheet experience.

Never allow important controls to overflow horizontally.

==================================================
COMPONENT ARCHITECTURE
==================================================

Use reusable components.

Suggested conceptual structure:

TaskDirectory
├── TaskPageHeader
├── TaskSearchBar
├── TaskToolbar
│   ├── FiltersButton
│   └── ViewToggle
├── ActiveFilterChips
├── TaskListView
│   └── TaskTable
├── TaskCardView
│   └── TaskCard
├── TaskStatusControl
├── FilterModal
├── Pagination
├── TaskListSkeleton
└── EmptyTaskState

Use variants instead of duplicating components.

For example:

TaskCard
- default
- loading
- completed
- overdue

TaskStatusControl
- pending
- in-progress
- completed
- loading
- disabled

==================================================
BACKEND INTEGRATION READINESS
==================================================

The visual implementation must be easy to connect to the existing ASP.NET Core backend.

Conceptual architecture:

TaskDirectory
      ↓
useTasks / task state
      ↓
taskService
      ↓
API client
      ↓
ASP.NET Core API

Service functions should conceptually include:

taskService.getTasks()
taskService.searchTasks()
taskService.getTask()
taskService.updateTask()

Do not put raw HTTP requests inside table rows or cards.

The task UI should consume typed task data.

Search/filter state should be separate from visual representation state.

For example:

Task data state
Search state
Filter state
Pagination state
View mode state
Loading state
Error state

Changing List ↔ Cards should only change presentation state.

==================================================
FILTER STATE
==================================================

Keep filter state structured and backend-friendly.

Conceptually:

{
  keyword,
  status,
  priority,
  category,
  dueDateFrom,
  dueDateTo,
  page,
  pageSize
}

Only include fields actually supported by the existing TaskSearchDto.

Do not invent API query parameters.

==================================================
ACCESSIBILITY
==================================================

Follow design.md.

Ensure:

- Keyboard-accessible filters.
- Keyboard-accessible table rows/cards.
- Visible focus states.
- Accessible status controls.
- Proper labels for search/filter controls.
- Tooltips for icon-only buttons.
- Do not rely solely on color for task status or priority.

==================================================
FINAL QUALITY BAR
==================================================

The finished Task Directory should feel like a natural continuation of the existing Dashboard.

It should communicate:

"I can quickly find my tasks, understand their state, filter them efficiently, and update their progress."

It should NOT feel like:

- A generic CRUD table.
- An admin interface.
- A cluttered filter form.
- A marketplace clone.
- A collection of unrelated cards.

Use the interaction quality of modern productivity applications and the clean filtering philosophy of premium marketplaces such as Chrono24 as inspiration, while preserving the application's own visual identity.

The most important UX principles are:

1. Tasks should be immediately scannable.
2. Search should be obvious.
3. Filtering should be powerful but hidden behind one clean Filters control.
4. List/Card switching should feel fluid.
5. Task rows/cards should clearly be clickable.
6. Status updating should be easy.
7. Restricted actions should not appear.
8. Loading, empty, and error states must be designed.
9. The page should use available space intelligently.
10. Everything must remain visually consistent with design.md and the existing Dashboard.
```
