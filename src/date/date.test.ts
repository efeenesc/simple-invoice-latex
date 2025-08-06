import { months, getMonthNameByNum, parseDateSyntax } from "./date";

describe("Date utilities", () => {
	describe("months object", () => {
		test("should contain all month names and abbreviations", () => {
			expect(months).toEqual({
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
			});
		});

		test("should have correct month indices (0-11)", () => {
			expect(months.January).toBe(0);
			expect(months.December).toBe(11);
			expect(months.Feb).toBe(1);
			expect(months.Jul).toBe(6);
		});

		test("should have both full and abbreviated names for each month", () => {
			expect(months.January).toBe(months.Jan);
			expect(months.February).toBe(months.Feb);
			expect(months.March).toBe(months.Mar);
			expect(months.April).toBe(months.Apr);
			expect(months.June).toBe(months.Jun);
			expect(months.July).toBe(months.Jul);
			expect(months.August).toBe(months.Aug);
			expect(months.September).toBe(months.Sep);
			expect(months.October).toBe(months.Oct);
			expect(months.November).toBe(months.Nov);
			expect(months.December).toBe(months.Dec);
		});
	});

	describe("getMonthNameByNum", () => {
		test("should return month names for valid indices", () => {
			expect(getMonthNameByNum(0)).toBeDefined();
			expect(["January", "Jan"]).toContain(getMonthNameByNum(0));

			expect(getMonthNameByNum(1)).toBeDefined();
			expect(["February", "Feb"]).toContain(getMonthNameByNum(1));

			expect(getMonthNameByNum(11)).toBeDefined();
			expect(["December", "Dec"]).toContain(getMonthNameByNum(11));
		});

		test("should return undefined for invalid indices", () => {
			expect(getMonthNameByNum(-1)).toBeUndefined();
			expect(getMonthNameByNum(12)).toBeUndefined();
			expect(getMonthNameByNum(100)).toBeUndefined();
		});

		test("should return a string that exists in months object", () => {
			for (let i = 0; i < 12; i++) {
				const monthName = getMonthNameByNum(i);
				expect(monthName).toBeDefined();
				expect(months[monthName!]).toBe(i);
			}
		});
	});

	describe("parseDateSyntax", () => {
		/** June 15, 2025 */
		const testDate = new Date(2025, 5, 15);

		test("should return base date when no operations", () => {
			const result = parseDateSyntax("", testDate);
			expect(result).toEqual(testDate);
		});

		test("should handle current month operation", () => {
			const result = parseDateSyntax("current-month", testDate);
			expect(result).toEqual(testDate);
		});

		test("should handle previous month operation", () => {
			const result = parseDateSyntax("prev-month", testDate);
			expect(result).toEqual(new Date(2025, 4, 15)); // May 15, 2025
		});

		test("should handle next month operation", () => {
			const result = parseDateSyntax("next-month", testDate);
			expect(result).toEqual(new Date(2025, 6, 15)); // July 15, 2025
		});

		test("should handle first month of year operation", () => {
			const result = parseDateSyntax("first-month", testDate);
			expect(result).toEqual(new Date(2025, 0)); // January 1, 2025
		});

		test("should handle specific day of month", () => {
			const result = parseDateSyntax("1", testDate);
			expect(result).toEqual(new Date(2025, 5, 1)); // June 1, 2025
		});

		test("should handle first day of month", () => {
			const result = parseDateSyntax("first-day", testDate);
			expect(result).toEqual(new Date(2025, 5, 1)); // June 1, 2025
		});

		test("should handle last day of month", () => {
			const result = parseDateSyntax("last-day", testDate);
			expect(
				new Date(result.getFullYear(), result.getMonth(), result.getDate())
			).toStrictEqual(new Date(2025, 5, 30)); // June 30, 2025
		});

		test("should handle first working day of month", () => {
			const juneFirst2025 = new Date(2025, 5, 1); // June 1, 2025: Sunday
			const result = parseDateSyntax("first-workingday", juneFirst2025);
			expect(result).toEqual(new Date(2025, 5, 2)); // Should be June 2: Monday
		});

		test("should handle add operations", () => {
			const result1 = parseDateSyntax("add-5-days", testDate);
			expect(result1).toEqual(new Date(2025, 5, 20)); // June 20, 2025

			const result2 = parseDateSyntax("add-1-week", testDate);
			expect(result2).toEqual(new Date(2025, 5, 22)); // June 22, 2025

			const result3 = parseDateSyntax("add-2-months", testDate);
			expect(result3).toEqual(new Date(2025, 7, 15)); // August 15, 2025

			const result4 = parseDateSyntax("add-1-year", testDate);
			expect(result4).toEqual(new Date(2026, 5, 15)); // June 15, 2024
		});

		test("should handle subtract operations", () => {
			const result1 = parseDateSyntax("sub-5-days", testDate);
			expect(result1).toEqual(new Date(2025, 5, 10)); // June 10, 2025

			const result2 = parseDateSyntax("sub-1-week", testDate);
			expect(result2).toEqual(new Date(2025, 5, 8)); // June 8, 2025

			const result3 = parseDateSyntax("sub-2-months", testDate);
			expect(result3).toEqual(new Date(2025, 3, 15)); // April 15, 2025

			const result4 = parseDateSyntax("sub-1-year", testDate);
			expect(result4).toEqual(new Date(2024, 5, 15)); // June 15, 2022
		});

		test("should handle chained operations with pipe separator", () => {
			const result = parseDateSyntax("first-day|add-10-days", testDate);
			expect(result).toEqual(new Date(2025, 5, 11)); // June 11, 2025
		});

		test("should handle formatting operations", () => {
			const result1 = parseDateSyntax("to-formatted", testDate);
			expect(result1).toBe("June 15, 2025");

			const result2 = parseDateSyntax("to-name-month", testDate);
			expect(result2).toBe("June");

			const result3 = parseDateSyntax("to-number-year", testDate);
			expect(result3).toBe(2025);

			const result4 = parseDateSyntax("to-number-month", testDate);
			expect(result4).toBe(6); // 1-based month number
		});

		test("should use current date when no base date provided", () => {
			const beforeCall = new Date();
			const result = parseDateSyntax("current-month");
			const afterCall = new Date();

			expect(result).toBeInstanceOf(Date);
			expect((result as Date).getTime()).toBeGreaterThanOrEqual(
				beforeCall.getTime() - 1000
			);
			expect((result as Date).getTime()).toBeLessThanOrEqual(
				afterCall.getTime() + 1000
			);
		});

		test("should handle complex chained operations", () => {
			// Go to first day of current month, then add 2 weeks, then format
			const result = parseDateSyntax(
				"first-day|add-2-weeks|to-formatted",
				testDate
			);
			expect(result).toBe("June 15, 2025");
		});

		describe("complex chained operations", () => {
			test("current-year|to-number-year should return current year", () => {
				const result = parseDateSyntax("current-year|to-number-year", testDate);
				expect(result).toBe(2025);
			});

			test("next-month|first-workingday|to-formatted should return formatted first working day of next month", () => {
				const result = parseDateSyntax(
					"next-month|first-workingday|to-formatted",
					testDate
				);
				// July 1, 2025 is a Monday
				expect(result).toBe("July 1, 2025");
			});

			test("current-month|to-name-month should return current month name", () => {
				const result = parseDateSyntax("current-month|to-name-month", testDate);
				expect(result).toBe("June");
			});

			test("prev-month|last-workingday|to-formatted should return formatted last working day of previous month", () => {
				const result = parseDateSyntax(
					"prev-month|last-workingday|to-formatted",
					testDate
				);
				// May 31, 2025 is a Saturday, so May 30 is the last working day
				expect(result).toBe("May 30, 2025");
			});

			test("first-month|to-name-month should return first month name", () => {
				const result = parseDateSyntax("first-month|to-name-month", testDate);
				expect(result).toBe("January");
			});

			test("current-month|15|to-formatted should go to 15th of current month and format", () => {
				const result = parseDateSyntax(
					"current-month|15|to-formatted",
					testDate
				);
				expect(result).toBe("June 15, 2025");
			});

			test("next-month|1|add-1-week|to-formatted should go to first day of next month, add week, format", () => {
				const result = parseDateSyntax(
					"next-month|1|add-1-week|to-formatted",
					testDate
				);
				expect(result).toBe("July 8, 2025");
			});

			test("current-month|last-day|sub-5-days|to-name-day should get day name 5 days before end of month", () => {
				const result = parseDateSyntax(
					"current-month|last-day|sub-5-days|to-name-day",
					testDate
				);
				// June 30 - 5 days = June 25, 2025 Wednesday
				expect(result).toBe("Wednesday");
			});

			test("add-2-months|to-number-month should add 2 months and return month number", () => {
				const result = parseDateSyntax(
					"add-2-months|to-number-month",
					testDate
				);
				expect(result).toBe(8); // August
			});

			test("sub-1-year|to-number-year should subtract 1 year and return year", () => {
				const result = parseDateSyntax("sub-1-year|to-number-year", testDate);
				expect(result).toBe(2024);
			});

			test("first-day|add-10-days|to-number-week should get week number", () => {
				const result = parseDateSyntax(
					"first-day|add-10-days|to-number-week",
					testDate
				);
				// June 1 + 10 days = June 11, 2025
				expect(typeof result).toBe("number");
				expect(result).toBeGreaterThan(0);
			});

			test("last-day|to-number-day should return day of week for last day of month", () => {
				const result = parseDateSyntax("last-day|to-number-day", testDate);
				// June 30, 2025 is a Monday (day 1)
				expect(result).toBe(1);
			});

			test("multiple operation chain with arithmetic and formatting", () => {
				const result = parseDateSyntax(
					"first-day|add-2-weeks|sub-3-days|to-formatted",
					testDate
				);
				// June 1 + 14 days - 3 days = June 12, 2025
				expect(result).toBe("June 12, 2025");
			});

			test("working day operations with formatting", () => {
				const mondayDate = new Date(2025, 5, 5); // June 5, 2025: Thursday
				const result = parseDateSyntax(
					"current-month|first-workingday|add-4-days|to-formatted",
					mondayDate
				);
				// First working day is June 2, + 4 days = June 6
				expect(result).toBe("June 6, 2025");
			});
		});
	});
});
