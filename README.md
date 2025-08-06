# <sub>simple</sub> L<sup>A</sup>T<sub>E</sub>X invoice generator

A TypeScript and LaTeX based invoice generator. That's about it.

Its best feature is its ability to create and format dates from an invoice template. This is described under the JSON template syntax section below.

It calculates discounted, total, after-tax amounts of line items. Line items are passed through the JSON config file.

You can also declare additional fields in the LaTeX template, and pass them in through your config file.

## Installation

Run `yarn install` to install dev dependencies. There are no actual dependencies.

Make sure you also have a LaTeX distribution installed. The project attempts to use either XeLaTeX or PDFLaTeX.

Replace `logo.png` in project root and in src/latex/logo.png with your own logo.

## Usage

Configure your `invoice.json` (or alternatively-named) config file. You can refer to the `invoice.example.json` file, or read the **Configuration** section below.

Generate an invoice for the current month and year:

```bash
tsx index.ts
```

Or pass options:

```bash
tsx index.ts [OPTIONS]

OPTIONS:
    -c, --config CONFIG     JSON file containing invoice details (default: ./invoice.json)
    -m, --month MONTH       Month (full-name, 3-letter name, or 1-indexed number)
    -y, --year YEAR         Year (number, e.g. 2025)
    -h, --help              Show help

EXAMPLES:
    tsx index.ts -m 1                    # Generate for January, current year
    tsx index.ts -m March -y 2025        # Generate for March 2025
    tsx index.ts -c custom-invoice.json  # Use custom config file; defaults to current year, current month
```

## Configuration

The invoice configuration uses a JSON file with special template syntax for dynamic content.

### JSON Template Syntax

The system supports two types of templating:

#### 1. Date Templates (`{{}}`)

Date templates use double curly braces and support complex date operations:

```json
{
	"InvNumber": "INV-{{current-year|to-year-number}}-{{current-month|to-month-number}}",
	"Date": {
		"Issue": "{{current-month|20-day|to-formatted}}",
		"Delivery": "{{current-month|25-day|to-formatted}}",
		"Due": "{{next-month|first-workingday|to-formatted}}"
	}
}
```

##### Date Syntax Components

The date syntax uses a **pipe-based chain** where each operation is separated by `|`:

```
{{base-period|day-spec|date-math|formatter}}
```

**Base Periods** (starting point):

- `current-month` - The invoice month being generated
- `next-month` - Month after the invoice month
- `prev-month` - Month before the invoice month
- `current-year` - The invoice year being generated
- `first-month` - January of the invoice year

**Day Specifications** (which day of the month):

- `20-day` - Specific day (e.g., 20th)
- `first-day` - 1st day of month
- `last-day` - Last day of month (28-31 depending on month)
- `first-workingday` - First Monday-Friday of month
- `last-workingday` - Last Monday-Friday of month

**Date Math** (add/subtract time):

- `add-5-days` / `sub-3-days` - Add/subtract days
- `add-2-weeks` / `sub-1-week` - Add/subtract weeks
- `add-1-month` / `sub-6-months` - Add/subtract months
- `add-1-year` / `sub-2-years` - Add/subtract years

**Output Formatters** (how to display):

- `to-formatted` - Full format: "January 15, 2025"
- `to-month-name` - Month name: "January"
- `to-month-number` - Month number: "1" (1-indexed)
- `to-year-number` - Year: "2025"

**Complex Examples:**

```json
// Basic usage
"{{current-month|20-day|to-formatted}}"           // "August 20, 2025"
"{{current-year|to-year-number}}"                 // "2025"
"{{current-month|to-month-name}} Hours"           // "August Hours"

// Working day calculations
"{{next-month|first-workingday|to-formatted}}"    // "September 1, 2025"
"{{current-month|last-workingday|to-formatted}}"  // "August 29, 2025"

// Date math chains
"{{current-month|25-day|add-1-week|to-formatted}}" // "September 1, 2025" (Jan 25 + 7 days)
"{{next-month|first-day|sub-3-days|to-formatted}}" // "August 29, 2025" (Feb 1 - 3 days)

// Invoice numbering
"INV-{{current-year|to-year-number}}-{{current-month|to-month-number}}" // "INV-2025-8"

// Quarterly due dates
"{{current-month|add-3-months|15-day|to-formatted}}" // 3 months + 15 days from current
```

**Chaining Rules:**

- Operations are processed **left-to-right** through the pipe chain
- Each `|` passes the result to the next operation
- Missing components use defaults (current date, no math, formatted output)
- Invalid operations will cause the program to exit with an error

#### 2. LaTeX Templates (`<<>>`)

LaTeX templates use double angle brackets and reference flattened JSON properties:

```latex
\textbf{Invoice number} & <<INV-NUMBER>> \\
\textbf{<<ISSUER-NAME>>} && \textbf{Bill to} \\
<<ISSUER-ADDRESS-1>> && <<BILL-TO-NAME>> \\
```

Properties are automatically flattened and uppercased:

- `Issuer.Name` becomes `<<ISSUER-NAME>>`
- `BillTo.Address1` becomes `<<BILL-TO-ADDRESS-1>>`
- `Date.Issue` becomes `<<DATE-ISSUE>>`

### Example Configuration

```json
{
	"InvNumber": "INV-{{current-year|to-year-number}}-{{current-month|to-month-number}}",
	"Issuer": {
		"Name": "Your Name",
		"Address1": "123 Main Street",
		"Address2": "Suite 100",
		"Address3": "City, State 12345",
		"Phone": "+1 (555) 123-4567",
		"Email": "your.email@example.com"
	},
	"Date": {
		"Issue": "{{current-month|20-day|to-formatted}}",
		"Delivery": "{{current-month|25-day|to-formatted}}",
		"Due": "{{next-month|first-workingday|to-formatted}}"
	},
	"BillTo": {
		"Name": "Client Company",
		"Address1": "456 Business Ave",
		"Address2": "Client City, State 67890",
		"Line1": "Additional Info",
		"Line2": "client@company.com"
	},
	"PaymentNotes": "Payment terms and conditions",
	"Tax": 0.08,
	"LineItems": [
		{
			"Description": "{{current-month|to-month-name}} Consulting",
			"Qty": 40,
			"UnitPrice": 150.0,
			"Currency": "USD",
			"Symbol": "$",
			"Discount": 0.05
		}
	],
	"Bank": {
		"Name": "Your Bank Name",
		"ADDRESS": "Bank Address",
		"SWIFTCode": "BANKCODE123",
		"Account": {
			"IBAN": "US12 3456 7890 1234 5678 90",
			"Name": "Your Name",
			"Number": "1234567890"
		}
	}
}
```

## Structure

Generated invoices are saved in the following structure:

```
output/
├── 2024/
│   ├── 1/
│   │   ├── InvNumber.pdf
│   │   └── InvNumber.tex
│   └── 2/
│       ├── InvNumber.pdf
│       └── InvNumber.tex
└── 2025/
    └── 1/
        ├── InvNumber.pdf
        └── InvNumber.tex
```

The project structure:

- `index.ts` - Main CLI application
- `src/date/` - Date parsing and manipulation
- `src/builder/` - Template processing and LaTeX compilation
- `src/latex/` - LaTeX template and assets
- `invoice_example.json` - Example configuration template
- `months_years_example.csv` - Example info
- `create-invoices-example.sh` - Example bash script that uses example config and info to create a lot of JSON config files, later running the project against the config files
