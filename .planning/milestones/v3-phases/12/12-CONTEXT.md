# Phase 12: Visual Team Hierarchy

## Context

Following the successful implementation of real-time tracking, the management team needs a way to visualize the organizational structure. This will help in understanding reporting lines and quickly accessing team-specific data.

## Scope

- **Interactive Org Tree**: A dynamic, collapsible tree view of the entire workforce.
- **Manager-Subordinate Links**: Visualizing the `managerId` relationships in a clear, parent-child UI.
- **Quick-Action Integration**: Ability to click a team member in the tree to view their current location or attendance status.

## Exclusions

- **Territory Mapping**: Explicitly excluded by user request; all employees are considered "floating" and can visit any location.

## Technical Strategy

- **Library**: `react-d3-tree` or `reactflow` for a high-performance interactive tree.
- **Data Source**: A new tRPC procedure `users.getOrgTree` that recursively builds the hierarchy from the `users` table.
- **UI Placement**: A new "Team Management" tab or a sub-page under "Workforce".
