import { execSync } from "node:child_process";
import {
	readFileSync,
	writeFileSync,
	unlinkSync,
	renameSync,
	existsSync,
} from "node:fs";
import { join, basename } from "node:path";
import { fillLatexTemplate } from ".";
import { InvoiceConfig } from "./builder.interface";

export function runTemplater(
	filepath: string,
	invoiceConfig: InvoiceConfig
): string {
	const f = readFileSync(filepath, { flag: "r" });
	const str = f.toString();
	const formatted = str.replace(/<<([^>]*)>>/g, (_fullMatch, tags) =>
		fillLatexTemplate(_fullMatch, tags, invoiceConfig)
	);
	return formatted;
}

export function writeToFile(filepath: string, content: string): void {
	try {
		writeFileSync(filepath, content);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

export function compileLatex(location: string, texFile: string) {
	const compilers = ["xelatex", "pdflatex"];
	let compiler = null;

	// Check which compiler is available
	for (const cmd of compilers) {
		try {
			execSync(`command -v ${cmd}`, { stdio: "ignore" });
			compiler = cmd;
			break;
		} catch (error) {
			continue;
		}
	}

	if (!compiler) {
		throw new Error("No LaTeX compiler found");
	}

	console.log(`${compiler} -interaction=nonstopmode "${location}${texFile}"`);

	// Compile twice for proper references
	execSync(`${compiler} -interaction=nonstopmode "${location}${texFile}"`);
	execSync(`${compiler} -interaction=nonstopmode "${location}${texFile}"`);

	return compiler === "xelatex" ? "XeLaTeX" : "PDFLaTeX";
}

export function cleanupLatexFiles(
	texFileName: string,
	outputDir: string,
	workingDir: string = "./"
): void {
	const baseName = basename(texFileName, ".tex");
	const cleanupExtensions = [".aux", ".log", ".out"];

	// Remove auxiliary files
	for (const ext of cleanupExtensions) {
		const filePath = join(workingDir, `${baseName}${ext}`);
		if (existsSync(filePath)) {
			try {
				unlinkSync(filePath);
				console.log(`Removed: ${baseName}${ext}`);
			} catch (error) {
				console.warn(`Failed to remove ${baseName}${ext}:`, error);
			}
		}
	}

	// Move PDF to output directory
	const pdfPath = join(workingDir, `${baseName}.pdf`);
	if (existsSync(pdfPath)) {
		const outputPdfPath = join(outputDir, `${baseName}.pdf`);
		try {
			renameSync(pdfPath, outputPdfPath);
			console.log(`Moved PDF to: ${outputPdfPath}`);
		} catch (error) {
			console.error(`Failed to move PDF to output directory:`, error);
		}
	} else {
		console.warn(`PDF file not found: ${pdfPath}`);
	}
}
