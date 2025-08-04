export interface InvoiceConfig {
	/**
	 * Unique invoice number identifier
	 */
	InvNumber: string;
	Date: Dates;
	Issuer: Issuer;
	/**
	 * Customer billing information and contact details
	 */
	BillTo: BillTo;
	PaymentNotes: string;
	Tax: number;
	/**
	 * List of billable items/services included in the invoice
	 */
	LineItems: LineItem[];
	/**
	 * Filled during runtime. If this doesn't exist, run new Date().
	 */
	BASEDATE?: Date;
}

export interface Dates {
	Issue: string;
	Delivery: string;
	Due: string;
}

export interface Issuer {
	IssuerName: string;
	IssuerAddress1: string;
	IssuerAddress2: string;
	IssuerAddress3: string;
	IssuerPhone: string;
	IssuerEmail: string;
}

export interface LineItem {
	/**
	 * Detailed description of the product or service
	 */
	Description: string;
	/**
	 * Quantity of items or hours of service
	 */
	Qty: number;
	/**
	 * Price per unit before taxes and discounts
	 */
	UnitPrice: number;
	/**
	 * ISO 4217 currency code (3-letter format)
	 */
	Currency: string;
	/**
	 * Currency symbol for display purposes
	 */
	Symbol: string;
	/**
	 * Calculated during runtime
	 */
	AMOUNT: number;
	Discount: number;
	/**
	 * Calculated during runtime
	 */
	DISCOUNTAMOUNT: number;
}
export interface BillTo {
	BilledName: string;
	BilledAddress1: string;
	BilledAddress2: string;
	BilledAddress3: string;
	BilledEmail: string;
}

export interface FormattedLineItem {
	/**
	 * Detailed description of the product or service
	 */
	Description: string;
	/**
	 * Quantity of items or hours of service
	 */
	Qty: string;
	/**
	 * Price per unit before taxes and discounts
	 */
	UnitPrice: string;
	/**
	 * ISO 4217 currency code (3-letter format)
	 */
	Currency: string;
	/**
	 * Currency symbol for display purposes
	 */
	Symbol: string;
	/**
	 * Calculated during runtime
	 */
	AMOUNT: string;
	Discount: string;
}
