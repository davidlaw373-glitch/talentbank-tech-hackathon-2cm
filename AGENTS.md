# AGENTS.md

## Project Overview

This project uses **Next.js**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and the **Inter** font.

The project is currently in its early development stage. The main priority is to keep the frontend consistent across all team members and AI coding agents.

All frontend code must follow the rules in this file.

---

## Core Principle

Use the project defaults first.

Do not customize prematurely.

Do not create custom UI components when shadcn/ui already provides the needed component.

Do not manually change visual styles unless explicitly requested.

---

## Tech Stack Rules

This project uses the following stack:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Inter font

All frontend code must follow this stack.

Do not introduce another frontend framework.

Do not introduce another UI component library.

Do not introduce another styling system.

Do not introduce another font.

Do not add new dependencies unless explicitly requested.

---

## Next.js Rules

Follow the existing Next.js project structure.

If the project uses the `app/` directory, continue using the App Router structure.

Do not create a separate routing system.

Do not move route files unless explicitly requested.

Keep route files clean and readable.

Avoid putting large UI blocks, business logic, or repeated component code directly inside `page.tsx`.

Prefer extracting reusable UI into components.

Recommended structure:

```txt
src/
  app/
    dashboard/
      page.tsx
  components/
    features/
      dashboard/
        dashboard-overview.tsx
        dashboard-actions.tsx
```

Page files should mainly compose components:

```tsx
import { DashboardOverview } from "@/components/features/dashboard/dashboard-overview"

export default function DashboardPage() {
  return (
    <main>
      <DashboardOverview />
    </main>
  )
}
```

---

## TypeScript Rules

Use TypeScript for all project code.

Do not create new JavaScript files for application logic.

Use `.ts` for logic files.

Use `.tsx` for React components.

Avoid `any` unless there is no reasonable alternative.

Prefer explicit types for:

* component props
* API responses
* form values
* reusable utility functions
* database records
* status values

Allowed example:

```tsx
type InvoiceCardProps = {
  invoiceId: string
  customerName: string
  status: "draft" | "reviewed" | "approved"
}

export function InvoiceCard({
  invoiceId,
  customerName,
  status,
}: InvoiceCardProps) {
  return (
    <div>
      <p>{customerName}</p>
      <small>{status}</small>
    </div>
  )
}
```

Avoid example:

```tsx
export function InvoiceCard(props: any) {
  return <div>{props.customerName}</div>
}
```

---

## Font Rule

The project font is **Inter**.

Do not use other fonts.

Do not import additional fonts.

Do not configure another font unless explicitly requested.

---

## Typography Rules

Only use the following semantic text elements for typography:

* `h1`
* `h2`
* `h3`
* `h4`
* `h5`
* `h6`
* `p`
* `small`

Do not create custom typography components unless explicitly requested.

Do not manually customize font size, line height, letter spacing, or font weight unless explicitly requested.

Do not use arbitrary font sizes.

Avoid:

```tsx
<h1 className="text-[34px] font-bold tracking-tight">
  Dashboard
</h1>
```

Prefer:

```tsx
<h1>Dashboard</h1>
<p>Review uploaded invoice records.</p>
<small>Last updated today</small>
```

Do not use Tailwind typography classes such as:

```tsx
text-xs
text-sm
text-base
text-lg
text-xl
text-2xl
text-[13px]
text-[17px]
text-[21px]
font-bold
font-semibold
tracking-tight
leading-7
```

unless explicitly requested.

At this stage, typography should remain simple and semantic.

---

## shadcn/ui Component Rules

Use shadcn/ui components for UI development.

When a shadcn/ui component exists, use it instead of creating a custom component.

Common required components:

* Use shadcn `Button` for buttons.
* Use shadcn `Input` for text inputs.
* Use shadcn `Textarea` for long text input.
* Use shadcn `Select` for dropdowns.
* Use shadcn `Checkbox` for checkboxes.
* Use shadcn `Card` for grouped content.
* Use shadcn `Dialog` for modals.
* Use shadcn `Table` for tabular data.
* Use shadcn `Badge` for labels or statuses.
* Use shadcn `Tabs` for tabbed content.
* Use shadcn `Form` for forms when applicable.
* Use shadcn `DropdownMenu` for dropdown actions.
* Use shadcn `Alert` for alert messages.
* Use shadcn `Separator` for separators.

Do not create custom versions of existing shadcn components.

Allowed example:

```tsx
import { Button } from "@/components/ui/button"

export function SubmitButton() {
  return <Button>Submit</Button>
}
```

Avoid example:

```tsx
export function SubmitButton() {
  return (
    <button className="rounded-md bg-blue-600 px-4 py-2 text-white">
      Submit
    </button>
  )
}
```

---

## Component Styling Rules

At the current stage, use the default shadcn/ui component styles.

Do not customize component colors.

Do not customize component size.

Do not customize component border radius.

Do not customize component shadows.

Do not customize component borders.

Do not add additional CSS to change the visual appearance of shadcn components unless explicitly requested.

Avoid:

```tsx
<Button className="bg-green-600 hover:bg-green-700 text-white">
  Save
</Button>
```

Prefer:

```tsx
<Button>
  Save
</Button>
```

For destructive actions, use the built-in shadcn variant only when appropriate:

```tsx
<Button variant="destructive">
  Delete
</Button>
```

Do not create new variants unless explicitly requested.

---

## Color Rules

Use the default shadcn/ui color system.

Do not manually recolor components.

Do not use hardcoded Tailwind color classes.

Avoid:

```tsx
bg-blue-500
bg-green-600
bg-red-500
text-red-500
text-gray-700
border-gray-300
hover:bg-blue-700
```

Do not introduce a custom color palette at this stage.

Do not edit shadcn theme colors unless explicitly requested.

Do not edit CSS variables for color customization unless explicitly requested.

---

## CSS Rules

Do not add extra CSS for visual styling unless explicitly requested.

Do not create custom CSS files for component styling.

Do not use inline styles for visual styling.

Avoid:

```tsx
<div style={{ fontSize: "17px", color: "#2563eb" }}>
  Content
</div>
```

Avoid:

```css
.custom-button {
  background-color: blue;
  color: white;
  border-radius: 8px;
}
```

Use shadcn defaults instead.

---

## Tailwind Usage Rules

Tailwind CSS may be used for layout only.

Allowed Tailwind usage:

* `flex`
* `grid`
* `items-center`
* `items-start`
* `items-end`
* `justify-center`
* `justify-between`
* `justify-end`
* `gap-*`
* `space-y-*`
* `space-x-*`
* `p-*`
* `px-*`
* `py-*`
* `pt-*`
* `pb-*`
* `m-*`
* `mx-*`
* `my-*`
* `mt-*`
* `mb-*`
* `w-*`
* `h-*`
* `min-h-*`
* `max-w-*`
* `container`

Avoid Tailwind usage that changes visual design:

* custom colors
* custom font sizes
* custom shadows
* custom borders
* custom rounded corners
* arbitrary values
* custom background colors
* custom hover colors

Avoid:

```tsx
<Card className="rounded-2xl border-blue-300 shadow-xl">
```

Prefer:

```tsx
<Card>
```

Layout classes are acceptable when needed:

```tsx
<div className="grid gap-4">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## Folder Structure Rules

Use the existing folder structure.

Recommended structure:

```txt
src/
  app/
  components/
    ui/
    layout/
    common/
    features/
  lib/
  hooks/
  types/
  services/
```

Rules:

* `components/ui` is reserved for shadcn/ui components.
* Do not manually redesign files inside `components/ui`.
* `components/layout` is for shared layout components.
* `components/common` is for reusable project components.
* `components/features` is for feature-specific components.
* `lib` is for utilities, configuration, and shared helpers.
* `hooks` is for reusable React hooks.
* `types` is for shared TypeScript types.
* `services` is for API or external service logic.
* Avoid putting large UI blocks directly inside page files.

---

## Import Rules

Use existing project import aliases when available.

Prefer:

```tsx
import { Button } from "@/components/ui/button"
```

Avoid long relative imports when an alias is available:

```tsx
import { Button } from "../../../../components/ui/button"
```

---

## File Naming Rules

Use consistent file naming.

React component files should use kebab-case:

```txt
invoice-card.tsx
upload-panel.tsx
dashboard-overview.tsx
```

Component names should use PascalCase:

```tsx
export function InvoiceCard() {}
export function UploadPanel() {}
export function DashboardOverview() {}
```

Hooks should use the `use` prefix:

```txt
use-invoice-upload.ts
use-current-user.ts
```

Types should be clear and specific:

```tsx
type InvoiceStatus = "draft" | "reviewed" | "approved"

type UploadResult = {
  id: string
  fileName: string
  status: InvoiceStatus
}
```

---

## Page Structure Rules

Pages should be simple, consistent, and easy to scan.

Prefer this structure:

```tsx
<main>
  <section>
    <h1>Page Title</h1>
    <p>Short page description.</p>
  </section>

  <section>
    {/* shadcn/ui components */}
  </section>
</main>
```

Use shadcn `Card` for grouped content.

Use shadcn `Button` for actions.

Use shadcn `Table` for tabular data.

Use shadcn `Form` components for forms when applicable.

Avoid creating a unique page style for every page.

---

## Component Reuse Rules

Before creating a new component, check whether an existing component already solves the problem.

Before creating a custom UI component, check whether shadcn/ui already provides the needed component.

Do not create custom UI components for:

* buttons
* inputs
* textareas
* checkboxes
* selects
* dialogs
* cards
* tables
* badges
* tabs
* forms
* dropdown menus
* alerts
* separators

Use shadcn/ui first.

---

## Form Rules

Use shadcn/ui form-related components where applicable.

Use proper labels for form fields.

Do not create unlabeled form inputs.

Do not manually style form inputs.

Use TypeScript types for form values.

Prefer clear and simple validation logic.

---

## Table Rules

Use shadcn/ui `Table` components for tabular data.

Do not create custom table styling.

Do not manually style table borders, backgrounds, or row colors unless explicitly requested.

Table content should be readable and simple.

Use `Badge` for status display when appropriate.

---

## Dialog and Modal Rules

Use shadcn/ui `Dialog` for modals.

Do not create custom modal implementations.

Do not manually implement modal overlays, focus trapping, or keyboard handling.

Use the default shadcn Dialog behavior.

---

## Button Rules

Use shadcn/ui `Button` for all normal button actions.

Do not use raw `<button>` elements unless there is a strong technical reason.

Do not style buttons manually.

Do not hardcode button colors.

Do not create custom button variants.

Use default shadcn variants only when appropriate.

Allowed:

```tsx
<Button>Submit</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

Avoid:

```tsx
<button className="bg-blue-600 text-white rounded-lg px-4 py-2">
  Submit
</button>
```

---

## Accessibility Rules

Keep basic accessibility in place.

Rules:

* Buttons must have clear text labels.
* Icon-only buttons must include an accessible label.
* Form inputs should have labels.
* Dialogs should use shadcn `Dialog` components.
* Do not remove focus states.
* Do not replace accessible shadcn behavior with custom HTML.
* Use semantic HTML where possible.

---

## Code Quality Rules

Use TypeScript.

Avoid `any`.

Keep components small and readable.

Use clear names for components, props, functions, and files.

Do not duplicate logic unnecessarily.

Do not introduce new dependencies unless explicitly requested.

Do not mix large business logic directly inside UI components.

Extract repeated logic into utilities or hooks when appropriate.

---

## Agent Behavior Rules

Before editing frontend code:

1. Check existing components.
2. Prefer shadcn/ui components.
3. Use semantic typography only.
4. Use Inter font only.
5. Avoid custom visual styling.
6. Avoid custom colors.
7. Avoid arbitrary font sizes.
8. Use Tailwind only for layout unless explicitly requested.
9. Use TypeScript.
10. Follow the existing Next.js structure.

After editing frontend code, check:

1. No raw custom buttons were created.
2. No custom component was created when a shadcn component already exists.
3. No hardcoded colors were added.
4. No arbitrary font sizes were added.
5. No extra CSS was added for visual styling.
6. shadcn default styles are preserved.
7. Typography only uses `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, and `small`.
8. Inter remains the only font.
9. TypeScript is used correctly.
10. No unnecessary dependency was added.

---

## Prohibited Patterns

Do not add code like this:

```tsx
<button className="bg-blue-500 text-white px-4 py-2 rounded-md">
  Submit
</button>
```

Do not add code like this:

```tsx
<h1 className="text-[36px] font-bold text-gray-900">
  Dashboard
</h1>
```

Do not add code like this:

```tsx
<Card className="rounded-2xl shadow-xl border-blue-300">
  Content
</Card>
```

Do not add code like this:

```tsx
<div style={{ color: "#2563eb", fontSize: "18px" }}>
  Content
</div>
```

Do not add custom CSS for default component styling.

Do not create a new design system.

Do not manually recolor shadcn components.

---

## Preferred Patterns

Use code like this:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExamplePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Example Panel</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>This panel uses default shadcn/ui styling.</p>
        <Button>Continue</Button>
      </CardContent>
    </Card>
  )
}
```

Use layout classes only when needed:

```tsx
<main className="p-6">
  <section className="space-y-4">
    <h1>Dashboard</h1>
    <p>Review and manage uploaded records.</p>
  </section>
</main>
```

---

## Final Development Rule

The current design principle is:

Use shadcn/ui defaults first.

Use Inter only.

Use semantic typography only.

Use TypeScript only.

Use Tailwind mainly for layout.

Do not customize colors, font sizes, component styles, or visual design unless explicitly requested.
