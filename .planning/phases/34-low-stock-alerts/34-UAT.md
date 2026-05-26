# Phase 34 UAT: Real-Time Low Stock Alerts

## Test Strategy
- Ensure Notification Bell works.
- Ensure the Low Stock Alert banner persists when there are unread alerts.
- Ensure triggering a low-stock event creates a notification.
- Ensure dismissing the banner marks it as read.

## Test Cases

### 1. Alert Trigger (Stock Drop)
**Goal:** Verify stock drop triggers notification.
**Action:** Log a sale (or adjust stock) that drops a product's inventory below its `minThreshold` (e.g., 10).
**Expected:** A low-stock alert is created for the Manager/Admin.

### 2. Notification Bell & Badge
**Goal:** Verify the bell updates.
**Action:** Look at the top right header in the web portal.
**Expected:** The bell should show a red pulsing badge with the unread count, and clicking it should list the alerts.

### 3. Persistent Banner
**Goal:** Verify the Low Stock Banner.
**Action:** View the DashboardLayout with an unread low-stock alert.
**Expected:** A red "⚠️ Low Stock Alert" banner should be visible at the top of the main content area.

### 4. Dismiss Banner
**Goal:** Verify banner dismissal.
**Action:** Click the "Dismiss" button on the banner.
**Expected:** The banner should instantly disappear and the notification bell count should decrease.

## Test Results

### 1. Alert Trigger (Stock Drop)
- **Status:** [x] Failed (Usability / Logic Blockers)
- **Feedback:** 
  1. The sales form asks for manual Branch ID and Product ID instead of searchable names/dropdowns.
  2. The system enforces an "insufficient stock error" preventing sales when stock is low. The business model allows made-to-order, so sales should be allowed to drive inventory negative, and inventory/sales should be kept decoupled for this validation.

### 2. Notification Bell & Badge
- **Status:** [ ] Untested
- **Feedback:** 

### 3. Persistent Banner
- **Status:** [ ] Untested
- **Feedback:** 

### 4. Dismiss Banner
- **Status:** [ ] Untested
- **Feedback:** 
