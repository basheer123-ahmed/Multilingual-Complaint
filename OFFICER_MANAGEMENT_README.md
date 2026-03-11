# CitizenCare: Officer & Department Management Logic

This guide explores the dynamic officer-to-department allocation system.

## 1. Officer Onboarding
When a new user registers as an **Officer** via the registration portal, they are initialized with an `UNASSIGNED` status. They lack a department affiliation until an Administrator performs a manual allocation.

## 2. Administrator Allocation (The "No-Code" Workflow)
Administrators now manage personnel via the **Active Duty Roster** (Admin Hub > Officers):
- **Real-time Synchronization**: The roster automatically reflects all registered officers in the system.
- **Allocation Terminal**: Clicking the **ALLOCATE** button opens a management pane where the Admin selects the appropriate Municipal Branch (Sanitation, Healthcare, etc.).
- **KPI Tracking**: Once allocated, the officer's performance ledger is initialized.

## 3. Dynamic Task Assignment
In the **Complaints Ledger**, the assignment logic has been upgraded:
- **Filtered Intelligence**: When an Admin clicks **ASSIGN** on a complaint, the system identifies the complaint category.
- **Personnel Mapping**: The "Field Agent" dropdown is dynamically populated exclusively with real officers who are currently allocated to the relevant department.
- **End-to-End Traceability**: All assignments are logged in the historical dossier for full accountability.

---
*System maintained by CitizenCare Command Hub.*
