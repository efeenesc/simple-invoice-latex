import { cpSync, readFileSync } from "fs";
import { months } from "./src/date/date";
import {
	runTemplater,
	writeToFile,
	compileLatex,
	cleanupLatexFiles,
} from "./src/builder";
import type { InvoiceConfig } from "./src/builder/builder.interface";

const TEMPLATE_FILE = "./src/latex/template.tex";
const OUTPUT_DIR = "./output";
let CONFIG_FILE = "./invoice.json";
let MONTH_NUM: number | undefined;
let YEAR_NUM: number | undefined;

function showHelp() {
	const executable = process.argv[0];
	console.log(
		`LaTeX Template Generator

USAGE:
    ${executable} [OPTIONS]

OPTIONS:
    -c, --config CONFIG     JSON file containing invoice details
    -m, --month MONTH       Month (full-name, 3-letter name, or 1-indexed number)
    -y, --year YEAR         Year (number, e.g. 2025)
    -h, --help              Show this help

EXAMPLES:
    ${executable} -m 1
    ${executable} -m March -y 2025`
	);
}

function getArgs() {
	if (process.argv.length > 1) {
		let idx = 0;

		while (process.argv[idx]) {
			switch (process.argv[idx]) {
				case "-c":
				case "--config": {
					if (CONFIG_FILE !== "./invoice.json") {
						console.error("error: multiple configs specified");
						process.exit(1);
					}
					CONFIG_FILE = process.argv[idx + 1];
					idx += 2;
					break;
				}
				case "-y":
				case "--year": {
					if (YEAR_NUM !== undefined) {
						console.error("error: multiple years specified");
						process.exit(1);
					}
					const num = Number(process.argv[idx + 1]);
					if (isNaN(num) || num < 1970) {
						console.error(`error: invalid year ${process.argv[idx + 1]}`);
						process.exit(1);
					}
					YEAR_NUM = num;
					idx += 2;
					break;
				}
				case "-m":
				case "--month": {
					if (MONTH_NUM !== undefined) {
						console.error("error: multiple months specified");
						process.exit(1);
					}
					let num = Number(process.argv[idx + 1]);
					if (isNaN(num)) {
						num = months[process.argv[num - 1]];
						if (num === undefined) {
							console.error(
								`error: invalid 1-indexed month ${process.argv[idx + 1]}`
							);
							process.exit(1);
						}
					} else if (num <= 0 || num > 12) {
						console.error(
							`error: invalid 1-indexed month ${process.argv[idx + 1]}`
						);
						process.exit(1);
					}
					MONTH_NUM = num;
					idx += 2;
					break;
				}
				case "-h":
				case "--help": {
					showHelp();
					process.exit(0);
				}
				default: {
					if (process.argv[idx].startsWith("-")) {
						console.error(`error: unknown argument ${process.argv[idx]}`);
						showHelp();
						process.exit(1);
					}
					idx++;
					break;
				}
			}
		}
	}
}

function main() {
	getArgs();

	const today = new Date();
	const year = YEAR_NUM ?? today.getFullYear();
	const month = MONTH_NUM ?? today.getMonth() + 1;

	let configContent: string;
	try {
		configContent = readFileSync(CONFIG_FILE, "utf-8");
	} catch (err) {
		console.error("Error: unable to load config at", CONFIG_FILE);
		process.exit(1);
	}

	const invoiceConfig: InvoiceConfig = JSON.parse(configContent);
	invoiceConfig.BASEDATE = new Date(year, month - 1);
	const completed = runTemplater(TEMPLATE_FILE, invoiceConfig);

	const filename = invoiceConfig.InvNumber;

	const fullOutputFolder = `${OUTPUT_DIR}/${year}/${month}/`;
	const tempTemplateFile = `${fullOutputFolder}${filename}.tex`;

	try {
		cpSync(TEMPLATE_FILE, tempTemplateFile);
	} catch (err) {
		console.error("Failed to copy template file:", err);
		process.exit(1);
	}

	writeToFile(tempTemplateFile, completed);
	compileLatex(fullOutputFolder, `${filename}.tex`);
	cleanupLatexFiles(`${filename}.tex`, fullOutputFolder);
}

main();
