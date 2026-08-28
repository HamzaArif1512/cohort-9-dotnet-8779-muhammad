# Task Management Frontend — Visual Design System

## 1. Design Direction

Create a **professional developer-operations interface** inspired by tools such as Postman, Linear, GitHub Projects, and modern internal enterprise dashboards.

The visual language should be:

- Minimalistic but not bland.
- Information-dense but never cluttered.
- Professional and suitable for an enterprise/internal productivity application.
- Clean, structured, and slightly technical.
- Confident rather than playful.
- Generous with whitespace where it improves hierarchy, but never leave large unexplained empty areas.
- Avoid decorative UI that does not serve a functional purpose.
- Avoid excessive gradients, glassmorphism, oversized typography, excessive shadows, or marketing-style hero sections.

The interface should feel like a **well-designed engineering/productivity console**, not a generic admin template.

---

# 2. Color System

Use the following palette as the foundation.

### Primary

`#7F40E4`

Use for:

- Primary buttons.
- Active navigation states.
- Links.
- Focus indicators.
- Selected controls.
- Important interactive elements.
- Progress/selection indicators where appropriate.

### Secondary

`#FFC000`

Use sparingly for:

- Warnings.
- Attention states.
- Important highlights.
- Priority indicators.
- Small visual accents.

Do not use purple and yellow equally throughout the interface. Purple should be the dominant interaction color; yellow should communicate attention or importance.

### Base Colors

- Background: `#F8F8F7`
- Surface/Card: `#FFFFFF`
- Primary text: `#111111`
- Secondary text: `#5F5F5F`
- Muted text: `#8A8A8A`
- Border: `#E5E5E5`
- Strong border: `#D6D6D6`
- Black accent: `#000000`
- White: `#FFFFFF`

### Semantic Colors

Use restrained semantic colors:

- Success: professional green.
- Warning: yellow/gold based around `#FFC000`.
- Error: professional red.
- Informational: muted purple/blue.

Semantic colors should not overpower the interface.

---

# 3. Color Usage Rules

Use color to establish hierarchy rather than decoration.

Preferred hierarchy:

1. Black/dark text for structure.
2. White surfaces for content.
3. Purple for interaction.
4. Yellow for attention.
5. Semantic colors only when communicating state.

Avoid:

- Purple text everywhere.
- Yellow backgrounds everywhere.
- Fully colored cards for ordinary content.
- Rainbow status badges.
- Heavy gradients.
- High-saturation decorative elements.

The UI should remain visually calm even when many tasks or rows are displayed.

---

# 4. Typography

Use two complementary fonts.

## Primary Font — Archivo

Use **Archivo** for:

- Page headings.
- Navigation.
- Buttons.
- Labels.
- Table headers.
- Metric values.
- Form labels.
- Status labels.
- Important UI text.

Recommended weights:

- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

## Secondary Font — Jost

Use **Jost** for:

- Body text.
- Descriptions.
- Supporting information.
- Helper text.
- Longer content.

Recommended weights:

- Regular: 400
- Medium: 500
- SemiBold: 600

Do not introduce additional fonts.

Typography should feel compact, modern, and readable.

Avoid excessively large headings. Page titles should establish hierarchy without consuming excessive vertical space.

---

# 5. Layout Philosophy

Use a consistent application shell.

Desktop structure:

- Compact left navigation.
- Top contextual header where useful.
- Main content area.
- Consistent page container.
- Responsive content widths.

Do not use a large traditional 240–300px sidebar simply to fill space.

The navigation should be compact, approximately **72–88px wide** on desktop, with icons and tooltips.

This prevents the low number of application sections from creating an unnecessarily empty sidebar.

The main content should use the available horizontal space intelligently.

---

# 6. Sidebar

The sidebar should feel intentional even though there are relatively few navigation items.

Use:

- Compact width.
- Application logo/mark at the top.
- Clear iconography.
- Active state using the primary purple.
- Tooltips on hover.
- User/profile control toward the bottom.
- Logout should not be permanently prominent in the primary navigation.

Admin-only navigation items should appear only for administrators.

Do not create fake navigation items merely to make the sidebar appear full.

Whitespace inside the sidebar should feel deliberate.

---

# 7. Header

Use a restrained top header.

It may contain:

- Current page/context.
- Breadcrumbs where useful.
- Search or contextual controls where appropriate.
- User avatar/profile trigger.
- Optional page actions.

Avoid oversized headers.

The header should establish context while leaving maximum room for useful content.

---

# 8. Cards

Cards should use:

- White background.
- Subtle `1px` border.
- Small to moderate border radius.
- Very subtle shadow only where elevation is needed.
- Clear internal spacing.

Recommended visual direction:

```text
background: #FFFFFF
border: 1px solid #E5E5E5
border-radius: 10–14px
```

Avoid heavy shadows.

Cards should feel like organized surfaces rather than floating decorative objects.

---

# 9. Tables

Tables are an important part of the application.

They should prioritize readability and scanning.

Use:

- Strong but compact column headers.
- Clear row spacing.
- Subtle horizontal separators.
- Hover highlighting.
- Consistent status/priority badges.
- Right-aligned numeric information where appropriate.
- Sticky headers when a table becomes long enough to require scrolling.

Do not create excessive borders around every cell.

Rows should feel grouped rather than boxed individually.

---

# 10. List / Card View Toggle

Where a list/card view toggle exists, make the transition feel polished.

The toggle should:

- Use a compact segmented control.
- Clearly indicate the active state.
- Have a fluid animated transition.
- Preserve the current filters and sorting.
- Avoid abrupt layout changes.

Example visual behavior:

```text
[ List | Cards ]
       ↑
   active state
```

Use a subtle transition around 150–250ms.

When switching views, use a small opacity/transform transition rather than a distracting animation.

The toggle itself must have:

```css
cursor: pointer;
```

and a clear hover state.

---

# 11. Buttons

Every clickable button must clearly look interactive.

Buttons must have:

```css
cursor: pointer;
```

Use clear states:

- Default.
- Hover.
- Active/pressed.
- Focus.
- Disabled.
- Loading.

Primary button:

- Purple background.
- White text.
- Slightly darker/lighter hover treatment.
- Small elevation or visual shift on hover.

Secondary button:

- White/light background.
- Dark text.
- Border.
- Purple hover emphasis.

Destructive button:

- Restrained red.
- Never use aggressive visual treatment unless the action is genuinely destructive.

Buttons should have subtle hover animations, approximately 150–200ms.

Example interaction:

```text
Default
   ↓ hover
Slight color change
+ subtle elevation
+ tiny translateY(-1px)
```

Do not over-animate buttons.

---

# 12. Links and Interactive Elements

All interactive elements must visibly communicate that they are interactive.

For:

- Buttons.
- Links.
- Cards that navigate.
- Dropdown options.
- Tabs.
- Toggle controls.
- Sidebar items.

Use:

```css
cursor: pointer;
```

Interactive cards may use:

- Subtle border-color transition.
- Slight shadow increase.
- Tiny translateY movement.

Avoid large scale effects.

---

# 13. Hover Animations

Animations should be subtle and consistent.

Use a general transition system around:

```css
transition:
  background-color 180ms ease,
  border-color 180ms ease,
  color 180ms ease,
  box-shadow 180ms ease,
  transform 180ms ease,
  opacity 180ms ease;
```

Recommended hover behavior:

- Buttons: color + slight elevation.
- Cards: border/shadow + tiny vertical movement.
- Navigation: background/foreground transition.
- Table rows: subtle background change.
- Tabs: smooth active indicator.
- Toggles: smooth thumb/indicator movement.

Avoid:

- Large scaling.
- Bouncing.
- Long animations.
- Excessive motion.
- Decorative animations unrelated to user interaction.

Respect `prefers-reduced-motion`.

---

# 14. Loading States

Every asynchronous operation must have a deliberate loading state.

Never leave users wondering whether a request is processing.

Use:

### Page loading

Skeleton placeholders rather than blank screens.

### Tables

Skeleton rows matching the eventual table structure.

### Cards

Skeleton blocks matching card dimensions.

### Buttons

When submitting:

```text
[ Creating... ]
```

or a small spinner while maintaining the button's dimensions.

Do not allow button width to jump when loading text appears.

### Forms

Disable duplicate submission while the request is pending.

### Data refresh

Prefer subtle inline loading indicators instead of replacing the entire page with a spinner.

---

# 15. Empty States

Empty states should use available space intentionally.

Never display a completely blank content area.

Provide:

- Short explanation.
- Simple icon/illustration.
- Primary next action where appropriate.

Example:

```text
No tasks found

There are no tasks matching your current filters.

[ Clear Filters ]
```

Empty states should remain compact and professional.

Avoid cartoonish illustrations.

---

# 16. Error States

Errors should be visible but not visually overwhelming.

Use:

- Inline form errors for validation.
- Toasts for transient operation results.
- Page-level error panels for failed data loading.
- Retry actions where appropriate.

Do not expose raw backend exception messages to ordinary users.

---

# 17. Toast Notifications

Use a centralized toast/notification system.

Toasts should appear consistently in the same location, preferably the **top-right** on desktop.

Types:

- Success.
- Error.
- Warning.
- Information.

Examples:

```text
✓ Task created successfully
✓ Profile updated successfully
✓ Account created successfully

! Unable to load tasks
! Your session has expired

⚠ Please complete all required fields
```

Toast behavior:

- Enter with subtle slide/fade.
- Remain visible long enough to read.
- Automatically dismiss when appropriate.
- Allow manual dismissal.
- Do not stack excessively.
- Use semantic colors subtly.
- Do not cover important controls.

For important destructive operations, prefer confirmation UI over relying only on a toast.

---

# 18. Forms

Forms should be clean and compact.

Use:

- Clear labels above inputs.
- Consistent input heights.
- Visible focus state.
- Helpful validation messages.
- Consistent spacing.
- Group related fields logically.

Focus state should use the primary purple.

Example:

```text
Label

┌────────────────────────────┐
│ Input                      │
└────────────────────────────┘
```

On focus:

- Purple border.
- Subtle purple focus ring.

Validation errors should appear directly below the relevant field.

Do not wait until form submission to show obvious field-level errors when validation can be performed earlier.

---

# 19. Tabs

Authentication tabs and similar controls should use a clean segmented/tab design.

Active tab:

- Purple emphasis.
- Strong typography.
- Smooth indicator transition.

Inactive tab:

- Muted text.
- Clear hover state.

Switching tabs should not cause the surrounding layout to jump unnecessarily.

---

# 20. Status Badges

Use compact badges for:

- Pending.
- In Progress.
- Completed.
- Priority levels.
- Roles.

Badges should be readable but restrained.

Avoid oversized pill components.

Use subtle backgrounds with strong enough text contrast.

Example visual hierarchy:

```text
● In Progress
● Completed
● Pending
```

The dot can communicate state while the badge remains visually lightweight.

---

# 21. Priority Visualization

Priority should be visually distinct but not dominate the interface.

Recommended:

- Low → muted/neutral.
- Medium → yellow/gold emphasis.
- High → stronger warning emphasis.

Do not use huge colored blocks for priority.

Priority should remain scannable in tables and cards.

---

# 22. Spacing System

Use a consistent spacing scale.

Recommended base:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Prefer multiples of 4.

Use larger spacing between major sections and smaller spacing between related controls.

Avoid:

- Components touching each other.
- Random spacing values.
- Huge empty areas.
- Excessively dense forms.

---

# 23. Whitespace Strategy

The goal is **intentional whitespace**, not maximum whitespace.

Use whitespace to:

- Separate hierarchy.
- Group related information.
- Improve scanning.
- Give cards breathing room.

When a page would otherwise have a large empty region, use meaningful information such as:

- Recent activity.
- Upcoming tasks.
- Summary information.
- Secondary metadata.
- Helpful empty states.
- Contextual actions.

Do not add fake charts or decorative panels merely to fill space.

---

# 24. Responsive Behavior

The design must be responsive from the beginning.

Desktop:

- Compact sidebar.
- Multi-column layouts.
- Full task tables.

Tablet:

- Reduced spacing.
- Compact navigation.
- Adaptive tables.

Mobile:

- Sidebar transforms into a compact mobile navigation pattern.
- Tables may become horizontally scrollable or transform into cards.
- Cards stack vertically.
- Forms become single-column.
- Dashboard metrics become a responsive grid.

Do not simply shrink desktop layouts.

Reflow content intelligently.

---

# 25. Accessibility

Every design component should support:

- Keyboard navigation.
- Visible focus states.
- Sufficient color contrast.
- Semantic buttons/links.
- Proper form labels.
- Accessible tooltips.
- Accessible status communication.
- Reduced-motion preferences.

Do not rely on color alone to communicate status.

---

# 26. Component Architecture

Build the frontend using reusable components rather than duplicating markup.

Recommended conceptual structure:

```text
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── auth/
│   ├── dashboard/
│   ├── tasks/
│   ├── profile/
│   └── admin/
│
├── pages/
│
├── services/
│   ├── authService
│   ├── taskService
│   ├── dashboardService
│   ├── profileService
│   └── adminUserService
│
├── hooks/
├── types/
├── utils/
├── context/
└── routes/
```

Keep visual components independent from API implementation wherever possible.

The UI should receive data through props/hooks/state rather than directly coupling components to HTTP calls.

---

# 27. Backend Integration Readiness

The design should be created with eventual backend integration in mind.

Use clear separation:

```text
UI Component
      ↓
Hook / State
      ↓
Service Layer
      ↓
API Client
      ↓
ASP.NET Core Backend
```

Do not place raw API calls throughout visual components.

Create reusable service functions for each backend domain.

Examples conceptually:

```text
authService.login()
authService.register()
authService.refreshToken()
authService.logout()

dashboardService.getUserDashboard()
dashboardService.getAdminDashboard()

taskService.getTasks()
taskService.searchTasks()
taskService.getTask()
taskService.createTask()
taskService.updateTask()
taskService.deleteTask()

profileService.getProfile()

adminUserService.getUsers()
adminUserService.getUser()
adminUserService.createUser()
```

The visual design should not depend on mock-data-specific structures.

Use typed data contracts so replacing mock data with real API responses is straightforward.

---

# 28. State Design

Every data-driven component should account for:

```text
idle
loading
success
empty
error
```

Forms should additionally account for:

```text
editing
submitting
validation-error
success
server-error
```

This should be visible in the design through appropriate states.

Do not design only the ideal successful state.

---

# 29. Modals and Confirmation

Use modals sparingly.

Appropriate uses:

- Confirming destructive deletion.
- Short administrative actions.
- Compact creation workflows where appropriate.

Avoid putting long forms inside small modals.

For complex forms, use full pages/panels instead.

---

# 30. Icons

Use a single consistent icon library/style.

Icons should be:

- Simple.
- Monoline or similarly consistent.
- Medium weight.
- Used primarily for navigation and actions.

Do not mix multiple icon styles.

Every icon-only interactive control should have a tooltip/accessibility label.

---

# 31. Shadows and Borders

Favor borders over heavy shadows.

Recommended:

```text
Normal surface:
1px solid #E5E5E5

Elevated surface:
1px solid #E5E5E5
+
very subtle shadow
```

Use stronger shadows only for:

- Dropdowns.
- Popovers.
- Modals.
- Floating menus.

---

# 32. Dropdowns and Popovers

Dropdowns should have:

- White background.
- Subtle border.
- Moderate radius.
- Soft shadow.
- Clear hover state.
- Pointer cursor on options.
- Smooth open/close animation.

They should align precisely with their trigger.

---

# 33. Visual Consistency

All components should feel like they belong to one system.

Maintain consistency in:

- Border radius.
- Button heights.
- Input heights.
- Typography.
- Icon size.
- Shadows.
- Spacing.
- Animation duration.
- Focus states.
- Color semantics.

Do not create each page as an isolated visual design.

---

# 34. Design Tokens

Where possible, establish reusable design tokens for:

```text
colors
typography
spacing
radius
shadows
transitions
component heights
```

Example conceptual token groups:

```text
--color-primary
--color-secondary
--color-background
--color-surface
--color-text
--color-muted
--color-border

--radius-sm
--radius-md
--radius-lg

--spacing-xs
--spacing-sm
--spacing-md
--spacing-lg
--spacing-xl

--transition-fast
--transition-normal
```

This will make later frontend implementation significantly easier.

---

# 35. Code Quality Expectations

The generated frontend should be structured so that backend integration is straightforward.

Prioritize:

- Reusable components.
- Small focused components.
- Clear naming.
- No duplicated UI logic.
- No duplicated styling rules where reusable tokens/components make sense.
- Clear separation between presentation and data fetching.
- Typed interfaces/models.
- Centralized API configuration.
- Centralized error handling.
- Centralized toast handling.
- Centralized authentication state.

Avoid putting business logic directly into visual components.

---

# 36. Overall Quality Bar

The final interface should feel:

**Professional**
- Enterprise-ready.
- Consistent.
- Structured.

**Minimal**
- No unnecessary decoration.
- No fake content.
- No excessive visual effects.

**Modern**
- Smooth transitions.
- Clear hierarchy.
- Responsive layouts.
- Thoughtful interaction states.

**Information-rich**
- Efficient use of space.
- Strong tables and cards.
- Clear metrics.
- Useful filters.

**Not bland**
- Purple primary identity.
- Yellow attention accents.
- Strong typography.
- Subtle interaction animations.
- Carefully designed empty/loading/error states.

The design should communicate:

> **"A polished internal engineering/productivity platform."**

not:

> **"A generic CRUD admin dashboard."**

---

# 37. Figma Make Guidance

When implementing this visual system in Figma Make:

1. Establish the color and typography tokens first.
2. Establish reusable buttons, inputs, badges, cards, tables, tabs, dropdowns, toasts, and loading states.
3. Establish the application shell and responsive behavior.
4. Use consistent components and variants rather than recreating similar elements.
5. Preserve the same spacing, radius, typography, and interaction language throughout the application.
6. Build realistic loading, empty, error, hover, active, disabled, and success states.
7. Keep interactions fluid and subtle.
8. Ensure every interactive element has a visible hover state and pointer cursor.
9. Avoid filling unused space with meaningless decoration.
10. Favor useful information density and visual hierarchy over decorative complexity.

The resulting design should be **production-oriented and implementation-friendly**, with components and tokens that can later be translated cleanly into React/CSS without redesigning the system.
