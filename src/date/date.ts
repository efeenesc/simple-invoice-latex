import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	endOfMonth,
	format,
	getWeek,
	isWeekend,
	startOfMonth,
	subDays,
	subMonths,
	subWeeks,
	subYears,
} from "date-fns";

export const months: Record<string, number> = {
	January: 0,
	Jan: 0,
	February: 1,
	Feb: 1,
	March: 2,
	Mar: 2,
	April: 3,
	Apr: 3,
	May: 4,
	June: 5,
	Jun: 5,
	July: 6,
	Jul: 6,
	August: 7,
	Aug: 7,
	September: 8,
	Sep: 8,
	October: 9,
	Oct: 9,
	November: 10,
	Nov: 10,
	December: 11,
	Dec: 11,
};

export function getMonthNameByNum(month: number) {
	return Object.keys(months).find((key) => months[key] === month);
}

export function parseDateSyntax(str: string, baseDate?: Date) {
	let d: string | number | undefined | Date = baseDate || new Date();
	const statements = str.split("|");

	const ops = statements.map((s) => mini(s));
	ops.forEach((o) => {
		d = o?.(d as any);
	});
	return d;
}

const initializers = ["prev", "current", "next"];
function mini(
	str: string
): undefined | ((month: Date) => Date | string | number | undefined) {
	if (!str) return;

	let spec: "first" | "current" | "next" | "last" | "prev" | undefined;
	let specDayNum: number | undefined;
	let math: "add" | "sub" | undefined;
	let mathNum: number | undefined;
	let isConv = false;
	let period: "year" | "month" | "week" | "day" | "workingday" | undefined;
	let convTo: "name" | "number" | "formatted" | undefined;

	const b = str.split("-");
	let i = 0;
	while (b[i]) {
		switch (b[i]) {
			case "first":
				spec = "first";
				break;
			case "last":
				spec = "last";
				break;
			case "prev":
				spec = "prev";
				break;
			case "current":
				spec = "current";
				break;
			case "next":
				spec = "next";
				break;
			case "workingday":
			case "workingdays":
				period = "workingday";
				break;
			case "add":
				math = "add";
				break;
			case "sub":
				math = "sub";
				break;
			case "to":
				isConv = true;
				break;
			case "formatted":
				convTo = "formatted";
				break;
			case "year":
			case "years":
				period = "year";
				break;
			case "month":
			case "months":
				period = "month";
				break;
			case "week":
			case "weeks":
				period = "week";
				break;
			case "day":
			case "days":
				period = "day";
				break;
			case "number":
				convTo = "number";
				break;
			case "name":
				convTo = "name";
				break;
			default: {
				const num = Number(b[i]);
				if (isNaN(num)) {
					console.error("error: invalid argument", b[i]);
					process.exit(1);
				}

				if (math) {
					mathNum = num;
				} else {
					specDayNum = num;
				}
			}
		}
		i++;
	}

	if (initializers.includes(spec as any) && period) {
		return (mon?: Date) => getInitialDate(mon, spec as any, period);
	} else if (specDayNum) {
		return (mon: Date) => getNthDayOfMonth(mon, specDayNum);
	} else if (spec && period) {
		return (mon: Date) => getDayOfMonth(mon, spec as any, period);
	} else if (math && mathNum && period) {
		return (mon: Date) => performDateCalc(mon, math, mathNum, period);
	} else if (isConv && convTo) {
		return (mon: Date) => performFormatting(mon, convTo, period as any);
	} else {
		printfatal("error: unknown command");
	}
}

function getInitialDate(
	month: Date | undefined,
	spec: "prev" | "current" | "next" | "first",
	period: "year" | "month" | "day" | "week" | "workingday"
): Date | undefined {
	if (!month) {
		month = new Date();
	}

	switch (spec) {
		case "current":
			return month;
		case "prev": {
			switch (period) {
				case "month":
					return subMonths(month, 1);
				default:
					printfatal(month, spec, period);
			}
		}
		case "next": {
			switch (period) {
				case "month":
					return addMonths(month, 1);
				default:
					printfatal(month, spec, period);
			}
		}
		case "first": {
			switch (period) {
				case "month":
					return new Date(month.getFullYear(), 0);
				default:
					printfatal(month, spec, period);
			}
		}
		default:
			printfatal(month, spec, period);
	}
}

function getNthDayOfMonth(month: Date, num: number) {
	return new Date(month.getFullYear(), month.getMonth(), num);
}

function getDayOfMonth(
	month: Date,
	pos: "first" | "last",
	type: "day" | "workingday" | any
) {
	if (pos === "first") {
		if (type === "day") {
			return startOfMonth(month);
		} else {
			let firstBusinessDay = startOfMonth(month);
			while (isWeekend(firstBusinessDay)) {
				firstBusinessDay = addDays(firstBusinessDay, 1);
			}
			return firstBusinessDay;
		}
	} else if (pos === "last") {
		if (type === "day") {
			return endOfMonth(month);
		} else {
			let lastBusinessDay = endOfMonth(month);
			while (isWeekend(lastBusinessDay)) {
				lastBusinessDay = subDays(lastBusinessDay, 1);
			}
			return lastBusinessDay;
		}
	} else {
		printfatal(pos);
	}
}

function performDateCalc(
	month: Date,
	type: "add" | "sub",
	num: number,
	period: "day" | "week" | "month" | "year" | "workingday"
) {
	if (type === "add") {
		switch (period) {
			case "day":
				return addDays(month, num);
			case "week":
				return addWeeks(month, num);
			case "month":
				return addMonths(month, num);
			case "year":
				return addYears(month, num);
			default:
				printfatal(type, period);
		}
	} else if (type === "sub") {
		switch (period) {
			case "day":
				return subDays(month, num);
			case "week":
				return subWeeks(month, num);
			case "month":
				return subMonths(month, num);
			case "year":
				return subYears(month, num);
			default:
				printfatal(type, period);
		}
	} else {
		printfatal(type);
	}
}

function performFormatting(
	d: Date,
	convTo: "name" | "number" | "formatted",
	period: "day" | "week" | "month" | "year" | "workingday"
) {
	if (convTo === "formatted") {
		return format(d as Date, "MMMM d, yyyy");
	} else if (convTo === "name") {
		switch (period) {
			case "month":
				return format(d, "MMMM");
			case "day":
				return format(d, "EEEE");
			default:
				printfatal("format name for", d, convTo, period);
		}
	} else if (convTo === "number") {
		switch (period) {
			case "year":
				return d.getFullYear();
			case "month":
				return d.getMonth() + 1;
			case "week":
				return getWeek(d);
			case "day":
				return d.getDay();
			default:
				printfatal(d, convTo, period);
		}
	}
}

function printfatal(...args: any[]) {
	const error = new Error();
	const frame = error.stack?.split("\n")[2];
	const functionName = frame?.split(" ")[5];
	console.error("error: unknown argument", args, functionName);
	process.exit(1);
}
