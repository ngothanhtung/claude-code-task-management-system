# Plan: Projects CRUD Module

## Context

Người dùng muốn tạo feature **Projects** với CRUD đầy đủ (Add, Update, List, Delete) dùng TanStack Table + Firebase Firestore + react-hook-form + zod. Tham khảo pattern `tasks` module — canonical reference trong codebase.

---

## Files to create (12 files)

### Layer 1 — Types & Data

| #   | File                                                   | Mô tả                              |
| --- | ------------------------------------------------------ | ---------------------------------- |
| 1   | `src/modules/projects/services/types/project-types.ts` | Zod schema + TypeScript interfaces |
| 2   | `src/modules/projects/services/project-mock-data.ts`   | 5 sample projects                  |

### Layer 2 — Services

| #   | File                                                | Mô tả                                                                                            |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 3   | `src/modules/projects/services/project-services.ts` | Firestore CRUD: getProjects, createProject, updateProject, deleteProject, seedProjectsWithClient |

### Layer 3 — Components

| #   | File                                                          | Mô tả                                                                                                                     |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 4   | `src/modules/projects/components/columns.tsx`                 | Factory `getProjectColumns({ onUpdate, onDelete })` — id, title, startDate, dueDate (sortable, red if overdue), createdAt |
| 5   | `src/modules/projects/components/data-table-row-actions.tsx`  | Dropdown: Edit (Dialog with react-hook-form + zod) + Delete                                                               |
| 6   | `src/modules/projects/components/add-project-modal.tsx`       | Dialog with react-hook-form + zod (title, startDate, dueDate)                                                             |
| 7   | `src/modules/projects/components/data-table-toolbar.tsx`      | Search by title, Seed button, View options, Add button                                                                    |
| 8   | `src/modules/projects/components/data-table-pagination.tsx`   | Copy từ tasks — generic                                                                                                   |
| 9   | `src/modules/projects/components/data-table-view-options.tsx` | Copy từ tasks — generic                                                                                                   |
| 10  | `src/modules/projects/components/data-table.tsx`              | useReactTable wrapper                                                                                                     |

### Layer 4 — Page & Navigation

| #   | File                                    | Mô tả                                        |
| --- | --------------------------------------- | -------------------------------------------- |
| 11  | `src/app/(dashboard)/projects/page.tsx` | Client page — owns state, optimistic updates |
| 12  | `src/components/app-sidebar.tsx`        | Thêm entry "Projects" (icon: Briefcase)      |

---

## Key Design Decisions

- **Date storage:** ISO string (`YYYY-MM-DD`) — `date-fns` format để hiển thị
- **Auto ID:** `PROJECT-${Date.now()}` (pattern từ tasks)
- **Form:** `react-hook-form` + `zodResolver` — title required, max 100 chars
- **Date picker:** shadcn `Calendar` + `Popover` trong form
- **Table:** TanStack Table — id, title, startDate, dueDate (sortable), createdAt (hidden by default)
- **Overdue:** `dueDate` hiển thị red badge khi đã quá hạn
- **CRUD pattern:** Create → full re-fetch; Update/Delete → optimistic local update
- **Mock fallback:** `getProjects()` trả `projectMockData` nếu Firestore empty
- **createdAt / updatedAt:** managed client-side as ISO strings (no serverTimestamp for simplicity)

---

## Implementation Order

1. `project-types.ts`
2. `project-mock-data.ts`
3. `project-services.ts`
4. `columns.tsx`
5. `data-table-row-actions.tsx`
6. `add-project-modal.tsx`
7. `data-table-pagination.tsx` (copy from tasks)
8. `data-table-view-options.tsx` (copy from tasks)
9. `data-table-toolbar.tsx`
10. `data-table.tsx`
11. `projects/page.tsx`
12. `app-sidebar.tsx` — thêm nav entry

---

## Verification

1. `npx tsc --noEmit` — TypeScript check
2. `npm run dev` — browser test: CRUD, date sorting, overdue badge, form validation
3. Verify: add project → appears in table, edit → saves to Firestore, delete → removes from table
