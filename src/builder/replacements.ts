import { parseDateSyntax } from "../date/date";
import type {
	InvoiceConfig,
	LineItem,
	FormattedLineItem,
} from "./builder.interface";

let flatInvConfig: Record<string, any>;

function flattenInvoiceConfig(conf: Record<string, any>, prefix: string = "") {
	const n: Record<string, any> = {};
	Object.keys(conf).forEach((k) => {
		const t = typeof conf[k];
		switch (t) {
			case "object": {
				const nest = flattenInvoiceConfig(conf[k], prefix + k);
				Object.keys(nest).forEach((k) => (n[k] = nest[k]));
				break;
			}
			case "string":
				n[(prefix + k).toUpperCase()] = conf[k] as string;
				break;
			case "boolean":
			case "number":
			case "bigint":
				n[(prefix + k).toUpperCase()] = conf[k];
				break;
			default:
				console.error(
					"err: unsupported type",
					t,
					"for key",
					k,
					"and val",
					conf[k]
				);
				break;
		}
	});
	return n;
}

export function fillStringTemplate(str: string, baseDate?: Date) {
	try {
		if (typeof str !== "string") return str;
		return str.replace(/{{([^}]*)}}/g, (_fullMatch, tag) => {
			return parseDateSyntax(tag, baseDate).toString();
		});
	} catch (err) {
		console.error(str);
		throw new Error();
	}
}

export function formatInvoiceConfig(conf: InvoiceConfig, baseDate?: Date) {
	Object.keys(conf).forEach((c) => {
		if (typeof (conf as any)[c] === "object") {
			formatInvoiceConfig((conf as any)[c] as any, baseDate);
		} else if (typeof (conf as any)[c] === "string") {
			(conf as any)[c] = fillStringTemplate((conf as any)[c] as any, baseDate);
		}
	});
	return conf;
}

export function calculateAmounts(
	lineItems: LineItem[],
	tax: number
): {
	lineItems: FormattedLineItem[];
	subtotal: string;
	discountTotal: string;
	tax: string;
	total: string;
} {
	let subtotal = 0;
	let discountTotal = 0;
	let symbol = "€";

	const items: FormattedLineItem[] = lineItems.map((l) => {
		const n: FormattedLineItem = {
			Symbol: l.Symbol,
			Currency: l.Currency,
			Description: l.Description,
			// Set everything below
			AMOUNT: "€9999",
			Discount: "9999%",
			Qty: "-1",
			UnitPrice: "€8888",
		};

		l.AMOUNT = l.UnitPrice * l.Qty;
		l.DISCOUNTAMOUNT = l.AMOUNT * l.Discount;
		l.AMOUNT -= l.DISCOUNTAMOUNT;
		discountTotal += l.DISCOUNTAMOUNT;
		subtotal += l.AMOUNT;

		n.Discount = l.Discount * 100 + "\\%";
		n.Currency = l.Currency;
		n.Qty = l.Qty.toString();
		n.AMOUNT = formatCurrency(n.Symbol, l.AMOUNT);
		n.UnitPrice = formatCurrency(n.Symbol, l.UnitPrice);
		symbol = n.Symbol;
		return n;
	});

	return {
		lineItems: items,
		subtotal: formatCurrency(symbol, subtotal),
		discountTotal: formatCurrency(symbol, discountTotal),
		tax: tax + "\\%",
		total: formatCurrency(symbol, subtotal * (1 - tax)),
	};
}

export function formatCurrency(symbol: string, num: number) {
	if (symbol === "$") {
		symbol = "\\$";
	}
	return (
		symbol +
		num.toLocaleString("en-US", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 3,
		})
	);
}

export function generateLineItems(lineItems: FormattedLineItem[]) {
	const lines: string[] = [];
	lineItems.forEach((l) => {
		lines.push(
			`${l.Description} & ${l.Qty} & ${l.UnitPrice} & ${l.Discount} & ${l.AMOUNT}`
		);
	});
	return lines.join("\\\\ \n");
}

export function fillLatexTemplate(
	_fullMatch: string,
	tag: string,
	invoiceConfig: InvoiceConfig
) {
	if (!flatInvConfig) {
		const amounts = calculateAmounts(
			invoiceConfig.LineItems,
			invoiceConfig.Tax
		);
		(invoiceConfig as any).LineItems = generateLineItems(amounts.lineItems);
		(invoiceConfig as any).Subtotal = amounts.subtotal;
		(invoiceConfig as any).DiscountTotal = amounts.discountTotal;
		(invoiceConfig as any).Total = amounts.total;
		(invoiceConfig as any).TAXPERCENT = invoiceConfig.Tax * 100 + "\\%";
		flatInvConfig = flattenInvoiceConfig(
			formatInvoiceConfig(invoiceConfig, invoiceConfig.BASEDATE)
		);
	}

	const t = tag.replaceAll("-", "");
	const v = (flatInvConfig as any)[t];
	if (!v) {
		console.error("error: no match found for template", tag);
		return "";
	}
	return v;
}
