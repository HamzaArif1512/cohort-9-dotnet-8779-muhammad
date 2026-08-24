Implement the Regular User Dashboard screen for my Task Management application.

IMPORTANT:
A design.md file has already been provided. Treat design.md as the PRIMARY visual and interaction specification for this screen. Follow its color system, typography, spacing, component architecture, animation principles, loading/error/empty states, responsive behavior, accessibility requirements, and overall visual direction. Do not introduce a separate visual style.

Do NOT design or implement any other application screens at this stage. Focus only on the Dashboard.

==================================================
DASHBOARD PURPOSE
==================================================

The dashboard is the authenticated Regular User's personal task overview.

It should allow the user to understand their current workload immediately without feeling like a generic analytics/admin dashboard.

The dashboard should be information-dense enough to avoid excessive whitespace, but remain clean, calm, and easy to scan.

The visual style should feel like a polished engineering/productivity application similar in quality to Linear, GitHub Projects, or Postman — while following the exact visual language established in design.md.

==================================================
AVAILABLE BACKEND DATA
==================================================

The backend returns a UserDashboardDto with the following fields:

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

The dashboard should be designed around these values.

Do not invent additional metrics that are not provided by the backend.

The screen should make it straightforward to connect these fields to the backend later.

==================================================
LAYOUT
==================================================

Create a balanced dashboard layout with a clear visual hierarchy.

Suggested structure:

1. Compact page header
2. Primary task metric cards
3. Secondary attention/action metrics
4. Completion/progress section
5. Status distribution visualization
6. Priority distribution visualization

The dashboard should use the available horizontal space intelligently.

Do NOT make the dashboard a giant grid of identical cards.

Use different visual weights to establish hierarchy.

==================================================
PAGE HEADER
==================================================

Create a compact header containing:

- Page title: "Dashboard"
- A short supporting sentence such as:
  "Here's an overview of your tasks and workload."

Keep the header compact.

Do not use a huge hero section.

The dashboard should get to the useful information quickly.

==================================================
PRIMARY METRICS
==================================================

Create a prominent row/grid containing the main task counters:

- Total Tasks
- Pending
- In Progress
- Completed

These should be the most immediately visible metrics.

Use reusable TaskSummaryCard-style components.

Each card should contain:

- Small descriptive label
- Large metric number
- Small supporting visual/icon
- Subtle status/accent treatment

Suggested visual hierarchy:

Total Tasks:
Neutral / primary purple accent.

Pending:
Neutral/warning treatment.

In Progress:
Purple/active treatment.

Completed:
Success treatment.

Do not make the cards overly colorful.

Use restrained semantic colors consistent with design.md.

==================================================
ATTENTION METRICS
==================================================

Below the primary metrics, create a smaller secondary section containing:

- Overdue Tasks
- Due Soon
- High Priority

These should visually communicate urgency without dominating the dashboard.

For example:

Overdue:
Use a subtle red/error treatment.

Due Soon:
Use the #FFC000 yellow/gold accent.

High Priority:
Use a stronger but restrained priority treatment.

These should feel like actionable signals rather than ordinary statistics.

==================================================
COMPLETION RATE
==================================================

Create a dedicated completion-progress card using:

CompletionRate

Display:

- Large percentage
- "Task completion rate" label
- A clean progress visualization

Example:

78%

Task completion rate

[████████████████░░░░]

Do not use a giant circular chart if it makes the dashboard feel decorative.

Prefer a clean progress bar or compact progress visualization.

The visualization should clearly communicate the percentage.

Handle 0% gracefully.

==================================================
TASK STATUS DISTRIBUTION
==================================================

Use TaskByStatus to create a compact visualization showing the distribution of tasks by status.

Use a clean chart appropriate for a productivity dashboard.

Possible presentation:

- Donut chart
OR
- Horizontal bar visualization

The visualization should clearly communicate:

- Pending
- In Progress
- Completed

Keep the chart compact and readable.

Do not use excessive colors.

Use the established semantic color system from design.md.

Include a legend or labels so the information is understandable without relying solely on color.

==================================================
TASK PRIORITY DISTRIBUTION
==================================================

Use TaskByPriority to create another compact visualization.

Show the distribution of:

- Low
- Medium
- High

A horizontal bar chart or compact distribution visualization is preferred.

High priority should use the established warning/attention treatment.

Medium should use the yellow/gold family.

Low should remain visually quiet.

Again, do not rely solely on color.

==================================================
WHITESPACE
==================================================

The dashboard must NOT feel empty.

At the same time, do not cram every metric into a dense grid.

Use a deliberate rhythm:

Page header
↓
Primary metrics
↓
Attention metrics
↓
Completion + distributions

Use cards of different sizes to create visual hierarchy.

A possible desktop layout:

------------------------------------------------
Dashboard header
------------------------------------------------

[ Total ] [ Pending ] [ In Progress ] [ Completed ]

[ Overdue ] [ Due Soon ] [ High Priority ]

------------------------------------------------

[ Completion Rate          ] [ Status Distribution ]
[ large percentage         ] [ chart + legend       ]

------------------------------------------------

[ Priority Distribution                         ]
[ chart / bars / legend                         ]

------------------------------------------------

Do not leave a huge blank area at the bottom.

==================================================
VISUAL STYLE
==================================================

Follow design.md exactly.

Primary identity:

#7F40E4

Secondary accent:

#FFC000

Base:

White surfaces
Near-white page background
Black/dark typography
Subtle gray borders

Typography:

Archivo:
- headings
- metric values
- labels
- navigation
- important UI elements

Jost:
- supporting descriptions
- body content
- secondary information

Do not introduce additional fonts.

==================================================
INTERACTION
==================================================

Cards and interactive dashboard elements should have subtle hover states.

Use:

- pointer cursor on interactive elements
- subtle border transition
- subtle shadow transition
- very small upward movement where appropriate

Animations should be approximately 150–250ms.

Do not use exaggerated animations.

Charts should have subtle entrance/hover behavior.

==================================================
LOADING STATE
==================================================

Design a complete dashboard loading state.

Do NOT show a blank page while dashboard data is loading.

Use skeleton placeholders for:

- Metric cards
- Secondary metrics
- Completion section
- Charts

Skeleton dimensions should match the actual components so the layout does not jump after loading.

==================================================
EMPTY STATES
==================================================

Handle a brand-new user with zero tasks.

The dashboard should remain useful and visually balanced when:

TotalTasks = 0
PendingTasks = 0
InProgressTasks = 0
CompletedTasks = 0
CompletionRate = 0

Charts should not look broken.

Instead, show a compact empty state such as:

"No tasks yet"

"Create your first task to start tracking your workload."

Include an appropriate action if the application supports task creation.

Do not invent backend functionality.

==================================================
ERROR STATE
==================================================

Design a dashboard-level error state for when the API request fails.

Example:

"Unable to load dashboard"

"Something went wrong while retrieving your task metrics."

[Retry]

Use a restrained error treatment.

==================================================
RESPONSIVENESS
==================================================

Design desktop and responsive behavior.

Desktop:
- Compact sidebar
- Multi-column metric layout
- Two-column analytical section

Tablet:
- Metrics wrap naturally
- Charts remain readable
- Reduce spacing where appropriate

Mobile:
- Single-column cards
- Charts stack vertically
- No horizontal overflow
- Preserve hierarchy

Do not simply shrink the desktop layout.

==================================================
COMPONENTIZATION
==================================================

Use reusable components.

Suggested conceptual components:

Dashboard
├── DashboardHeader
├── TaskSummaryCard
├── AttentionMetricCard
├── CompletionRateCard
├── TaskStatusChart
├── TaskPriorityChart
└── DashboardSkeleton

Do not duplicate card structures.

Create reusable variants where possible.

==================================================
BACKEND INTEGRATION READINESS
==================================================

The visual implementation must be easy to connect to the existing ASP.NET Core API.

The dashboard data will eventually come from:

GET /dashboard/user

Do not hard-code the dashboard metrics into the component architecture.

Use a clear conceptual separation:

Dashboard UI
    ↓
Dashboard state/hook
    ↓
dashboardService.getUserDashboard()
    ↓
GET /dashboard/user

The component should conceptually consume:

UserDashboardDto

with:

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

Use realistic mock data only for the visual prototype.

Keep the mock data structure identical to the eventual DTO structure so replacing it with the real API response is straightforward.

==================================================
FINAL DESIGN QUALITY
==================================================

The final dashboard should feel:

- Professional
- Minimalistic
- Modern
- Information-rich
- Calm
- Technical
- Enterprise-ready

It should NOT look like:

- A generic Bootstrap admin dashboard
- A collection of random statistic cards
- A marketing landing page
- An overly colorful analytics dashboard
- A dashboard filled with decorative charts

The primary visual goal is:

"At a glance, a user should immediately understand how much work they have, what requires attention, and how effectively they are completing their tasks."

Use design.md as the authoritative source for all visual decisions.