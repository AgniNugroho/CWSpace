import test from "node:test";
import assert from "node:assert/strict";
import { formatReservationPaymentTotal, canUseMembershipQuota } from "../payment";

test("formatReservationPaymentTotal displays accurate duration in hours for membership quota", () => {
  const result = formatReservationPaymentTotal("membership_quota", 3, 225000);
  assert.equal(result.primary, "3 Jam Kuota");
  assert.match(result.secondary, /Rp\s?0/);
});

test("formatReservationPaymentTotal formats rupiah for cash payments", () => {
  const bankResult = formatReservationPaymentTotal("transfer_bank", 2, 150000);
  assert.match(bankResult.primary, /150\.000/);

  const qrisResult = formatReservationPaymentTotal("qris", 1, 75000);
  assert.match(qrisResult.primary, /75\.000/);
});

test("canUseMembershipQuota validates user quota accurately against required hours", () => {
  // No membership
  const noMember = canUseMembershipQuota(null, 2);
  assert.equal(noMember.allowed, false);
  assert.ok(noMember.reason);

  // Insufficient quota (e.g. 1 hour remaining, needs 2 hours)
  const lowQuota = canUseMembershipQuota({ remaining_hours: 1 }, 2);
  assert.equal(lowQuota.allowed, false);
  assert.ok(lowQuota.reason?.includes("1 jam"));

  // Zero quota
  const zeroQuota = canUseMembershipQuota({ remaining_hours: 0 }, 2);
  assert.equal(zeroQuota.allowed, false);

  // Sufficient quota (e.g. 4 hours remaining, needs 2 hours)
  const sufficient = canUseMembershipQuota({ remaining_hours: 4 }, 2);
  assert.equal(sufficient.allowed, true);
});
