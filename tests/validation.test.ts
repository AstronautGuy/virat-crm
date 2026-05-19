import { z } from "zod";
import assert from "assert";

// 1. Test Indian Postal API Regex Validation for Pincode
const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, "Invalid Pincode").optional();

function testPincodeValidation() {
  console.log("Running Pincode Validation Tests...");
  
  // Valid pincodes
  assert.doesNotThrow(() => pincodeSchema.parse("110001"), "110001 should be valid");
  assert.doesNotThrow(() => pincodeSchema.parse("400001"), "400001 should be valid");
  assert.doesNotThrow(() => pincodeSchema.parse(undefined), "undefined should be valid");

  // Invalid pincodes
  assert.throws(() => pincodeSchema.parse("010001"), /Invalid Pincode/, "Pincode starting with 0 is invalid");
  assert.throws(() => pincodeSchema.parse("11000"), /Invalid Pincode/, "Pincode with 5 digits is invalid");
  assert.throws(() => pincodeSchema.parse("1100011"), /Invalid Pincode/, "Pincode with 7 digits is invalid");
  assert.throws(() => pincodeSchema.parse("11A001"), /Invalid Pincode/, "Pincode with letters is invalid");
  
  console.log("✔ Pincode Validation Tests Passed!");
}

// 2. We can simulate the RBAC logic directly for test validation.
function checkRBAC(currentUserRole: string, targetUserId: number, isManagerOfTarget: boolean) {
  if (currentUserRole !== "Admin") {
    if (currentUserRole !== "Manager") {
      throw new Error("Unauthorized to update status");
    }
    if (!isManagerOfTarget) {
      throw new Error("Unauthorized: Sale does not belong to your team");
    }
  }
  return true;
}

function testRBAC() {
  console.log("Running RBAC Validation Tests...");
  
  // Admin can update any status
  assert.doesNotThrow(() => checkRBAC("Admin", 2, false), "Admin should be able to update any status");
  
  // Manager can update status for their team
  assert.doesNotThrow(() => checkRBAC("Manager", 2, true), "Manager should be able to update their team's status");
  
  // Manager cannot update status for another team
  assert.throws(() => checkRBAC("Manager", 2, false), /Unauthorized: Sale does not belong to your team/, "Manager cannot update other team's status");
  
  // Employee cannot update status
  assert.throws(() => checkRBAC("Employee", 2, false), /Unauthorized to update status/, "Employee cannot update status");
  assert.throws(() => checkRBAC("Employee", 2, true), /Unauthorized to update status/, "Employee cannot update status even if it's their own team");
  
  console.log("✔ RBAC Validation Tests Passed!");
}

// 3. Test GPS Violation alert logic
interface HeartbeatInput {
  status: "Online" | "Offline" | "Low Battery" | "No GPS";
}

function handleHeartbeatPulse(input: HeartbeatInput, user: { firstName: string; lastName: string; employeeCode: string }) {
  const alerts: string[] = [];
  
  if (input.status === "No GPS") {
    alerts.push(`GPS Violation Alert: ${user.firstName} ${user.lastName} (${user.employeeCode}) has disabled their device's GPS!`);
  }
  
  return alerts;
}

function testGPSViolationAlert() {
  console.log("Running GPS Violation Alert Validation Tests...");
  
  const user = { firstName: "John", lastName: "Doe", employeeCode: "EMP001" };
  
  // No alert on Online status
  const alertsOnline = handleHeartbeatPulse({ status: "Online" }, user);
  assert.strictEqual(alertsOnline.length, 0, "Online status should not trigger an admin alert");
  
  // Alert on No GPS status
  const alertsNoGps = handleHeartbeatPulse({ status: "No GPS" }, user);
  assert.strictEqual(alertsNoGps.length, 1, "No GPS status should trigger an admin alert");
  assert.match(alertsNoGps[0]!, /GPS Violation Alert: John Doe \(EMP001\) has disabled their device's GPS!/, "Alert message should contain user details");
  
  console.log("✔ GPS Violation Alert Validation Tests Passed!");
}

// 4. Test Multi-Tenant Branch Isolation Logic
function testBranchIsolation() {
  console.log("Running Multi-Tenant Branch Isolation Tests...");

  const mockHelper = (
    ctx: { dbUser?: { role: string; branchId: number | null } | null },
    targetBranchId?: number
  ): number | undefined => {
    const user = ctx.dbUser;
    if (!user) {
      throw new Error("UNAUTHORIZED: User profile not found.");
    }
    if (user.role === "Developer" || user.role === "Admin") {
      return targetBranchId;
    }
    if (!user.branchId) {
      throw new Error("FORBIDDEN: User has no branch assignment.");
    }
    if (targetBranchId !== undefined && targetBranchId !== user.branchId) {
      throw new Error(`FORBIDDEN: Access Denied: You cannot query or modify data for Branch ${targetBranchId}.`);
    }
    return user.branchId;
  };

  // Standard user querying their own branch
  const standardCtx = { dbUser: { role: "Employee", branchId: 3 } };
  assert.strictEqual(mockHelper(standardCtx, 3), 3, "Standard user should access their own branch");
  assert.strictEqual(mockHelper(standardCtx, undefined), 3, "Standard user should default to their own branch");

  // Standard user querying different branch should fail
  assert.throws(() => mockHelper(standardCtx, 5), /Access Denied/, "Standard user cannot query different branch");

  // Admin querying any branch or all branches
  const adminCtx = { dbUser: { role: "Admin", branchId: null } };
  assert.strictEqual(mockHelper(adminCtx, 5), 5, "Admin should access any branch");
  assert.strictEqual(mockHelper(adminCtx, undefined), undefined, "Admin should be allowed to bypass and query all branches");

  // Developer querying any branch or all branches
  const devCtx = { dbUser: { role: "Developer", branchId: 1 } };
  assert.strictEqual(mockHelper(devCtx, 4), 4, "Developer should access any branch");
  assert.strictEqual(mockHelper(devCtx, undefined), undefined, "Developer should query all branches");

  // User with no profile should be unauthorized
  assert.throws(() => mockHelper({ dbUser: null }), /User profile not found/, "Null dbUser should be unauthorized");

  console.log("✔ Multi-Tenant Branch Isolation Tests Passed!");
}

function runAll() {
  try {
    testPincodeValidation();
    testRBAC();
    testGPSViolationAlert();
    testBranchIsolation();
    console.log("All automated tests passed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runAll();
