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

function runAll() {
  try {
    testPincodeValidation();
    testRBAC();
    console.log("All automated tests passed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runAll();
