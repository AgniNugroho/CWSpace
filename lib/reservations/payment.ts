/**
 * Formats a numeric price into Indonesian Rupiah (IDR).
 */
export function formatPrice(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Returns formatted primary and secondary payment labels for reservations.
 * If paying with membership quota, it clearly reflects the transacted hours (e.g. "2 Jam Kuota")
 * and explicitly denotes that the cash bill is Rp 0.
 */
export function formatReservationPaymentTotal(
  paymentMethod: string,
  totalHours: number,
  totalPrice: number
): { primary: string; secondary: string } {
  if (paymentMethod === "membership_quota") {
    return {
      primary: `${totalHours} Jam Kuota`,
      secondary: "Biaya Tunai: Rp 0 (Bebas Biaya)",
    };
  }

  return {
    primary: formatPrice(totalPrice),
    secondary: `${totalHours} Jam Sewa`,
  };
}

/**
 * Validates whether the user's active membership has sufficient remaining quota
 * for the requested reservation duration.
 */
export function canUseMembershipQuota(
  userMembership: { remaining_hours: number } | null | undefined,
  totalHours: number
): { allowed: boolean; reason?: string } {
  if (!userMembership) {
    return {
      allowed: false,
      reason: "Belum memiliki paket membership aktif.",
    };
  }

  if (userMembership.remaining_hours < totalHours) {
    return {
      allowed: false,
      reason: `Sisa kuota (${userMembership.remaining_hours} jam) tidak mencukupi untuk durasi ${totalHours} jam.`,
    };
  }

  return { allowed: true };
}
