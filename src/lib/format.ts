// Canonical business phone number, E.164. The old site printed two
// different formats ("045 783 14323" and "+358 45 78314323") — flagged
// for the client in PLAN.md §11; this is the working assumption until
// confirmed.
export const PHONE_E164 = "+3584578314323";

export function formatPhoneDisplay(e164: string): string {
	// "+3584578314323" -> "045 783 14323", matching the old site's grouping.
	const national = "0" + e164.slice(4);
	return national.replace(/(\d{3})(\d{3})(\d{5})/, "$1 $2 $3");
}
