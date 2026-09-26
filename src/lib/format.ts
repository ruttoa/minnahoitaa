export function formatPhoneDisplay(e164: string): string {
	// "+3584578314323" -> "045 783 14323" (client-confirmed display format).
	const national = "0" + e164.slice(4);
	return national.replace(/(\d{3})(\d{3})(\d{5})/, "$1 $2 $3");
}
