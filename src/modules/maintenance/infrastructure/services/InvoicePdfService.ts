import { v2 as cloudinary } from "cloudinary";
import { Invoice } from "../../domain/entities/Invoice";
import { Resident } from "../../../residents/domain/entities/Resident";
import { env } from "../../../../shared/config/env";

export class InvoicePdfService {

  async generateAndUpload(invoice: Invoice, resident: Resident | null): Promise<string> {
    const html = this.buildHtml(invoice, resident);

    let browser;
    try {
      const puppeteer = await import("puppeteer");

      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });

      const pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      });

      const pdfBuffer = Buffer.from(pdfBytes);

      return await this.uploadToCloudinary(pdfBuffer, invoice.id!);
    } catch (error) {
      console.error("InvoicePdfService.generateAndUpload failed:", error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  private uploadToCloudinary(buffer: Buffer, invoiceId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "invoices",
          public_id: `invoice-${invoiceId}`,
          resource_type: "raw",
          type: "upload",
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  private buildHtml(invoice: Invoice, resident: Resident | null): string {
    const monthName = new Date(invoice.year, invoice.month - 1).toLocaleString("en-IN", { month: "long" });

    const residentUser = resident ? (resident as any).user : null;
    const residentApartment = resident ? (resident as any).apartment : null;

    const extraChargesRows = invoice.extraCharges
      .map(
        (charge) => `
        <tr>
          <td>${charge.label}</td>
          <td class="amount">₹${charge.amount.toFixed(2)}</td>
        </tr>`
      )
      .join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { margin: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #1a1f36; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 30px 40px 20px; border-bottom: 3px solid #1a1f36; }
        .header h1 { font-size: 22px; margin: 0; }
        .header p { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
        .badge { background: #059669; color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 20px 40px 30px; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .meta-block p { margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-block .value { font-size: 14px; font-weight: 600; color: #1a1f36; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 10px 12px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .amount { text-align: right; }
        .total-row td { font-weight: 700; font-size: 14px; border-top: 2px solid #1a1f36; border-bottom: none; padding-top: 12px; }
        .payment-info { margin-top: 20px; padding: 12px 16px; background: #f3f4f6; border-radius: 6px; font-size: 12px; }
        .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${env.SOCIETY_NAME}</h1>
          <p>Maintenance Invoice &middot; ${monthName} ${invoice.year}</p>
        </div>
        <div class="badge">PAID</div>
      </div>
  
      <div class="content">
        <div class="meta-row">
          <div class="meta-block">
            <p>Billed to</p>
            <div class="value">${residentUser?.name ?? "Resident"}</div>
            <p style="margin-top: 6px;">Apartment</p>
            <div class="value">${residentApartment?.block ?? ""} - ${residentApartment?.unitNumber ?? ""}</div>
          </div>
          <div class="meta-block">
            <p>Invoice #</p>
            <div class="value">${invoice.id}</div>
            <p style="margin-top: 6px;">Paid on</p>
            <div class="value">${invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</div>
          </div>
        </div>
  
        <table>
          <thead>
            <tr><th>Description</th><th class="amount">Amount</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Maintenance charge (${monthName} ${invoice.year})</td>
              <td class="amount">₹${invoice.baseAmount.toFixed(2)}</td>
            </tr>
            ${extraChargesRows}
            <tr class="total-row">
              <td>Total Paid</td>
              <td class="amount">₹${invoice.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
  
        <div class="payment-info">
          <strong>Payment Reference:</strong> ${invoice.paymentRef ?? "-"}
        </div>
  
        <div class="footer">
          This is a system-generated invoice and does not require a signature.
        </div>
      </div>
    </body>
    </html>
    `;
  }
}