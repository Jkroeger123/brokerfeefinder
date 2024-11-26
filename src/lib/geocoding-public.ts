// Validate address format before making API call
export function isValidAddress(address: string): boolean {
  // Basic validation
  if (address.length < 5) return false;

  // Must contain numbers (likely street number)
  if (!/\d/.test(address)) return false;

  // Should contain letters (street name)
  if (!/[a-zA-Z]/.test(address)) return false;

  return true;
}
