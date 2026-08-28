Use this prompt. It keeps the **same dashboard design language** while adding the admin-specific system-wide metrics without turning the page into an overloaded analytics dashboard.

```text
Design and implement the Admin Dashboard for the Task Management application.

IMPORTANT:
The existing `design.md` file is the PRIMARY visual specification. The Regular User Dashboard has already been designed using it. The Admin Dashboard must feel like the same application and reuse the exact:

- Application shell
- Sidebar
- Header
- Typography
- Color palette
- Card styling
- Borders and radii
- Spacing system
- Shadows
- Hover animations
- Loading states
- Empty states
- Error states
- Toast system
- Responsive behavior

Do NOT create a separate admin visual theme.

==================================================
PURPOSE
==================================================

This dashboard is exclusively for Administrators.

Unlike the Regular User Dashboard, which displays personal task metrics, this dashboard provides a system-wide overview across all users.

The administrator should be able to understand:

1. Overall system workload.
2. How many users are actively involved in tasks.
3. Current task distribution.
4. Task completion performance.
5. Which priorities require attention.
6. How tasks are distributed among users.

The dashboard should remain clean and easy to scan.

Do NOT turn it into a complicated enterprise analytics dashboard.

==================================================
BACKEND DATA
==================================================

The backend returns:

AdminDashboardDto

with:

- TotalUsers
- ActiveAssignees
- TotalTasks
- PendingTasks
- InProgressTasks
- CompletedTasks
- OverdueTasks
- DueSoonTasks
- HighPriorityTasks
- CompletionRate
- TaskByStatus
- TaskByPriority
- TaskByAssignee

The dashboard will eventually retrieve this information from:

GET /dashboard/admin

Do not invent additional metrics that are not provided by the backend.

Use realistic mock data for the prototype, but keep the mock structure identical to the DTO so it can later be replaced directly with the API response.

==================================================
PAGE HEADER
==================================================

Reuse the Regular User Dashboard header.

Title:

"Admin Dashboard"

Supporting text:

"System-wide overview of users, tasks, and workload."

Keep the header compact.

Do not use a large hero section.

==================================================
TOP SYSTEM METRICS
==================================================

Add a prominent first row containing system-level metrics:

- Total Users
- Active Assignees
- Total Tasks
- Completion Rate

These are the most important administrative overview metrics.

Use the same TaskSummaryCard design language as the Regular User Dashboard.

Suggested visual treatment:

Total Users:
Neutral / purple accent.

Active Assignees:
Purple/active treatment.

Total Tasks:
Neutral primary treatment.

Completion Rate:
Success/progress treatment.

Do not make every card brightly colored.

==================================================
TASK STATUS METRICS
==================================================

Create a second metric section containing:

- Pending Tasks
- In Progress
- Completed
- Overdue
- Due Soon
- High Priority

Use compact metric cards.

The administrator should immediately see where attention is required.

Use semantic colors carefully:

Pending:
Neutral/warning.

In Progress:
Purple.

Completed:
Success.

Overdue:
Restrained red/error.

Due Soon:
#FFC000.

High Priority:
Strong but restrained attention treatment.

Do not make warning states visually overwhelming.

==================================================
COMPLETION RATE
==================================================

Include the same completion-rate visualization used on the Regular User Dashboard.

Use:

CompletionRate

Display:

- Large percentage.
- "Task completion rate".
- Clean progress bar/visualization.

Do not create a completely different component.

Reuse the existing CompletionRateCard.

==================================================
TASK STATUS DISTRIBUTION
==================================================

Use:

TaskByStatus

Create a compact visualization showing the system-wide distribution of:

- Pending
- In Progress
- Completed

Prefer a clean donut or horizontal bar visualization.

Reuse the visual language of the Regular User Dashboard.

The chart should communicate the overall system workload rather than individual-user performance.

Include labels/legend.

Do not rely on color alone.

==================================================
TASK PRIORITY DISTRIBUTION
==================================================

Use:

TaskByPriority

Display the system-wide distribution of:

- Low
- Medium
- High

Use a compact horizontal bar or similar visualization.

High priority should receive the strongest visual emphasis.

Medium should use the established yellow/gold attention treatment.

Low should remain visually quiet.

==================================================
TASKS BY ASSIGNEE
==================================================

This is the most important additional section that distinguishes the Admin Dashboard from the Regular User Dashboard.

Use:

TaskByAssignee

Create an administrative workload visualization showing how tasks are distributed among users.

A horizontal bar chart is preferred.

Example concept:

User                 Tasks
──────────────────────────────
Ali Khan             ███████████ 18
Sarah Ahmed          ████████ 13
Hamza Arif           ██████ 9
John Doe             ████ 6

The visualization should allow an administrator to quickly identify:

- Users with high task workloads.
- Users with relatively few tasks.
- Distribution imbalance.

Do not create a complicated analytics table.

Use the same visual style as the other dashboard charts.

If there are many assignees, design the component to support scrolling or a sensible top-N presentation without overwhelming the dashboard.

Do not invent a ranking endpoint.

The data must originate from TaskByAssignee.

==================================================
RECOMMENDED DESKTOP STRUCTURE
==================================================

Use a balanced composition such as:

------------------------------------------------
Admin Dashboard
System-wide overview...
------------------------------------------------

[ Total Users ] [ Active Assignees ] [ Total Tasks ] [ Completion Rate ]

[ Pending ] [ In Progress ] [ Completed ] [ Overdue ] [ Due Soon ] [ High Priority ]

------------------------------------------------

[ Completion Rate      ] [ Task Status Distribution ]
[ progress             ] [ chart + legend           ]

------------------------------------------------

[ Task Priority Distribution ] [ Tasks by Assignee ]
[ chart + legend             ] [ workload chart      ]

------------------------------------------------

Do not necessarily follow this exact arrangement if another layout better fits the established design system.

The key requirement is that the page has strong hierarchy and does not become visually repetitive.

==================================================
VISUAL HIERARCHY
==================================================

The administrator dashboard should visually prioritize:

1. Overall system workload.
2. Users/assignees.
3. Task status.
4. Attention metrics.
5. Priority distribution.

Do not make every metric equally prominent.

Use card size and layout to establish importance.

==================================================
WHITESPACE
==================================================

Avoid large unused areas.

Use the available desktop width intelligently.

Charts should occupy meaningful space rather than being tiny cards surrounded by whitespace.

At the same time, do not fill empty space with meaningless decorative widgets.

Every component should provide useful administrative information.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop:

- Compact application sidebar.
- Multi-column metric grid.
- Two-column analytical sections.
- Full-width assignee workload visualization where appropriate.

Tablet:

- Metrics wrap naturally.
- Charts remain readable.
- Reduce spacing where necessary.

Mobile:

- Single-column metric cards.
- Charts stack vertically.
- Assignee visualization becomes vertically scrollable if necessary.
- No horizontal page overflow.

Follow the responsive rules already established in design.md.

==================================================
LOADING STATE
==================================================

Design a complete Admin Dashboard loading state.

Skeletons should represent:

- User metrics.
- Task metrics.
- Completion rate.
- Status chart.
- Priority chart.
- Assignee workload chart.

Do not use a full-page spinner.

The page layout should remain stable while data loads.

==================================================
EMPTY STATES
==================================================

Handle scenarios such as:

No users:

"No users available"

No active assignees:

"No active assignees"

No tasks:

"No tasks available"

No assignee distribution:

"No assigned tasks to display"

Charts must not appear broken when their datasets are empty.

Do not add fake data to compensate for empty backend results.

==================================================
ERROR STATE
==================================================

If the admin dashboard API fails:

"Unable to load dashboard"

"Something went wrong while retrieving system metrics."

[ Retry ]

Use the same error-state styling as the Regular User Dashboard.

==================================================
PERMISSIONS
==================================================

This is an Administrator-only dashboard.

Do not expose Regular User dashboard terminology.

The UI should clearly communicate that metrics represent the entire system.

Do not add administrative actions that do not correspond to existing backend endpoints.

The dashboard is primarily an analytics/overview surface.

==================================================
COMPONENT REUSE
==================================================

Reuse components from the Regular User Dashboard wherever possible.

Conceptually:

AdminDashboard
├── DashboardHeader
├── SystemMetricCards
├── TaskSummaryCards
├── CompletionRateCard
├── TaskStatusChart
├── TaskPriorityChart
└── TaskAssigneeChart

Avoid duplicating existing components unnecessarily.

For example:

TaskSummaryCard should support variants rather than creating separate implementations for Admin and Regular User.

==================================================
BACKEND INTEGRATION
==================================================

The architecture should conceptually be:

AdminDashboard
      ↓
useAdminDashboard
      ↓
dashboardService.getAdminDashboard()
      ↓
GET /dashboard/admin

The UI should consume:

AdminDashboardDto

with:

TotalUsers
ActiveAssignees
TotalTasks
PendingTasks
InProgressTasks
CompletedTasks
OverdueTasks
DueSoonTasks
HighPriorityTasks
CompletionRate
TaskByStatus
TaskByPriority
TaskByAssignee

Do not put API requests directly inside individual metric cards or chart components.

The dashboard should be easy to connect to the existing ASP.NET Core backend later.

==================================================
INTERACTION
==================================================

Follow design.md.

Use:

- Pointer cursor for interactive elements.
- 150–250ms transitions.
- Subtle hover effects.
- Visible focus states.
- Smooth chart interactions.
- No excessive animations.

If chart elements are interactive, use subtle hover states/tooltips.

Do not make the dashboard feel like a data visualization demo.

==================================================
COLOR AND TYPOGRAPHY
==================================================

Use the established design system.

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
- Metric values
- Labels
- Navigation
- Important UI

Jost:
- Body text
- Descriptions
- Supporting information

Do not introduce additional fonts.

==================================================
FINAL QUALITY BAR
==================================================

The Admin Dashboard should feel like the administrative counterpart to the Regular User Dashboard.

The two dashboards should clearly belong to the same product.

Regular User:

"My tasks and my progress."

Admin:

"The system's tasks, users, workload, and progress."

The Admin Dashboard should provide more information without simply adding more cards.

Most importantly, it should remain:

- Professional.
- Minimalistic.
- Information-rich.
- Easy to scan.
- Visually balanced.
- Consistent with design.md.
- Consistent with the existing Regular User Dashboard.
- Ready for direct backend integration.

Avoid generic admin-dashboard patterns, excessive charts, unnecessary decorative widgets, and large unused whitespace.
```
