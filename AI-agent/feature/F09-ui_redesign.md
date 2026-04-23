# UI-REDESIGN: Global Design System
## Overview
VibeFlow redesign inspired by JIRA Kanban. Light theme. Full width on every page — no centered floating cards, no page-level max-width constraints.

---
## Colors
- Page bg: `#F7F8F9`
- Surface (cards, modals, sidebar): `#FFFFFF`
- Border: `#DFE1E6`
- Border hover: `#B3BAC5`
- Text primary: `#172B4D`
- Text secondary: `#6B778C`
- Text muted: `#97A0AF`
- Accent (primary): `#0052CC`
- Accent hover: `#0747A6`
- Accent light bg: `#DEEBFF`
- Danger: `#DE350B`
- Danger bg: `#FFEBE6`
- Success: `#006644`
- Success bg: `#E3FCEF`
- Warning: `#FF8B00`
- Warning bg: `#FFFAE6`
- Column header bg: `#F4F5F7`

---
## Typography
- Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Base: 14px, line-height 1.5
- Weight: 400 body, 500 labels/buttons, 600 headings
- Heading sizes: 24px (page), 16px (section), 14px (card title)

---
## Spacing
- 4, 8, 12, 16, 20, 24, 32, 48px

---
## Border Radius
- Inputs, buttons, badges: 3px (JIRA uses very small radius)
- Cards, modals: 3px
- Avatar circles: 50%

---
## Components
- Input: bg `#FAFBFC`, border `#DFE1E6`, height 32px, px 8px, focus border `#4C9AFF`, focus bg white, radius 3px
- Button primary: bg `#0052CC`, text white, height 32px, px 12px, radius 3px, hover `#0747A6`
- Button default: bg `#F4F5F7`, text `#172B4D`, border `#DFE1E6`, hover bg `#EBECF0`
- Badge/tag: bg `#DFE1E6`, text `#172B4D`, px 4px, py 2px, radius 3px, font 11px uppercase
- Avatar: circle, 24px, bg `#DFE1E6`, initials 11px `#172B4D`
- Dropdown: bg white, border `#DFE1E6`, shadow `0 4px 8px rgba(9,30,66,0.15)`, item hover bg `#F4F5F7`

---
## Layout Rules
- Every page: `width: 100%`, no outer max-width
- Left sidebar: 240px fixed, bg white, border-right `#DFE1E6`
- Top navbar: full width, height 56px, bg `#0052CC` (JIRA blue topbar)
- Page content: fills remaining width, padding `0 24px`, bg `#F7F8F9`
- No page-level centering wrappers

---
## Navbar (Top)
- bg: `#0052CC`
- App logo/name: white, left side
- Nav links: white, 14px, opacity 0.9, hover opacity 1
- User avatar: right side, circle 28px
- Height: 56px

---
## Sidebar
- Width: 240px, bg white, border-right `#DFE1E6`
- Project name: 14px, weight 600, `#172B4D`
- Nav items: 14px, `#6B778C`, hover bg `#F4F5F7`, active bg `#DEEBFF` text `#0052CC`
- Icons: 16px, left of label, 8px gap

---
## Out of Scope
- Dark mode
- Animations
- Mobile/responsive