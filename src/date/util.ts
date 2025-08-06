export function addDays(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
export function addMonths(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
}
export function addWeeks(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n * 7);
}
export function addYears(d: Date, n: number) {
	return new Date(d.getFullYear() + n, d.getMonth(), d.getDate());
}
export function endOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
export function format(d: Date, formatString: string) {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	return formatString
		.replace(/d/g, d.getDate().toString())
		.replace(/MMMM/g, months[d.getMonth()])
		.replace(/EEEE/g, days[d.getDay()])
		.replace(/yyyy/g, d.getFullYear().toString());
}
export function getWeek(d: Date) {
	const startOfYear = new Date(d.getFullYear(), 0, 1);
	const dayOfYear =
		Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) +
		1;
	return Math.ceil(dayOfYear / 7);
}
export function isWeekend(d: Date) {
	const day = d.getDay();
	return day === 0 || day === 6;
}
export function startOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function subDays(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n);
}
export function subMonths(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth() - n, d.getDate());
}
export function subWeeks(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n * 7);
}
export function subYears(d: Date, n: number) {
	return new Date(d.getFullYear() - n, d.getMonth(), d.getDate());
}
