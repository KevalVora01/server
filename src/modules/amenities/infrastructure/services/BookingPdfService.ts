import { v2 as cloudinary } from "cloudinary";
import { Booking } from "../../domain/entities/Booking";
import { Amenity } from "../../domain/entities/Amenity";
import { env } from "../../../../shared/config/env";

export class BookingPdfService {
  async generateAndUpload(booking: Booking, amenity: Amenity | null): Promise<string> {
    const html = this.buildHtml(booking, amenity);

    let browser;
    try {
      const puppeteer = await import("puppeteer");

      browser = await puppeteer.launch({
        headless: "shell",
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

      return await this.uploadToCloudinary(pdfBuffer, booking.id!);
    } catch (error) {
      console.error("BookingPdfService.generateAndUpload failed:", error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  private uploadToCloudinary(buffer: Buffer, bookingId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "booking-receipts",
          public_id: `booking-receipt-${bookingId}`,
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

  private buildHtml(booking: Booking, amenity: Amenity | null): string {
    const paidDate = booking.paidAt
      ? new Date(booking.paidAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

    const residentName = booking.resident?.name || `Resident #${booking.residentId}`;
    const residentEmail = booking.resident?.email || "";
    const residentPhone = booking.resident?.phone || "";

    const aptLabel =
      booking.apartment?.unitFormatted ||
      (booking.apartment
        ? `${booking.apartment.block}-${booking.apartment.floorNumber}${booking.apartment.unitNumber}`
        : `Apt #${booking.apartmentId}`);

    const amenityName = amenity?.name || `Amenity #${booking.amenityId}`;
    const amenityPrice = amenity?.price ?? 0;

    const isUpi = booking.paymentRef?.toUpperCase().startsWith("UPI");
    const paymentMethod = isUpi ? "UPI (GPay / PhonePe / Paytm)" : "Online / Manual";
    const paymentReference = booking.paymentRef
      ? booking.paymentRef.replace(/^UPI\s*[-:]?\s*/i, "UTR: ")
      : "—";

    const formattedBookingDate = (() => {
      try {
        const [y, m, d] = booking.bookingDate.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        return dt.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch {
        return booking.bookingDate;
      }
    })();

    const isShared = amenity?.bookingType === "SHARED_CAPACITY" || amenity?.isSharedCapacity;
    const attendeesText = isShared
      ? ` &bull; Attendees: ${booking.memberCount || 1} Person${(booking.memberCount || 1) > 1 ? "s" : ""}`
      : "";

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.5; }

        .page { width: 100%; min-height: 100vh; background: #f8fafc; padding: 30px 40px; }
        .card { background: #fff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: hidden; }

        /* ── Header ── */
        .top-bar { background: linear-gradient(135deg, #1e3a5f, #2d5a87); padding: 28px 36px; display: flex; justify-content: space-between; align-items: center; }
        .top-bar .left h1 { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: .3px; }
        .top-bar .left p { font-size: 11px; color: #b0cbe8; margin-top: 2px; }
        .top-bar .right { text-align: right; }
        .badge-paid { display: inline-block; background: #059669; color: #fff; font-size: 13px; font-weight: 700; padding: 6px 22px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; }
        .society-addr { padding: 10px 36px; background: #f1f5f9; font-size: 11px; color: #475569; border-bottom: 1px solid #e2e8f0; }

        /* ── Body ── */
        .body-content { padding: 24px 36px 20px; }

        .meta-grid { display: flex; justify-content: space-between; margin-bottom: 22px; gap: 20px; }
        .meta-col { flex: 1; }
        .meta-label { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; color: #94a3b8; margin-bottom: 4px; }
        .meta-value { font-size: 13px; font-weight: 600; color: #1e293b; }
        .meta-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
        .meta-divider { width: 100%; height: 1px; background: #e2e8f0; margin: 0 0 18px; }

        .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: #94a3b8; margin-bottom: 8px; }

        /* ── Table ── */
        table.invoice-table { width: 100%; border-collapse: collapse; }
        table.invoice-table th { padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; }
        table.invoice-table td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
        table.invoice-table .amt { text-align: right; font-variant-numeric: tabular-nums; }
        .total-row td { border-top: 2px solid #1e3a5f; border-bottom: none; font-weight: 700; font-size: 13px; color: #1e3a5f; padding-top: 10px; background: #f8fafc; }

        /* ── Payment box ── */
        .payment-box { margin-top: 20px; padding: 14px 18px; background: #f1f5f9; border-radius: 6px; border-left: 4px solid #2d5a87; }
        .payment-box .row { display: flex; justify-content: space-between; font-size: 11px; padding: 2px 0; }
        .payment-box .label { color: #64748b; }
        .payment-box .value { color: #1e293b; font-weight: 600; }

        /* ── Footer ── */
        .footer { text-align: center; padding: 16px 36px 22px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 6px; }
        .footer strong { color: #64748b; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="card">

          <!-- ─── TOP BAR ─── -->
          <div class="top-bar">
            <div class="left">
              <h1>${env.SOCIETY_NAME}</h1>
              <p>Amenity Booking Payment Receipt</p>
            </div>
            <div class="right">
              <div class="badge-paid">Paid</div>
            </div>
          </div>

          <div class="society-addr">${env.SOCIETY_ADDRESS}</div>

          <!-- ─── BODY ─── -->
          <div class="body-content">

            <!-- Meta -->
            <div class="meta-grid">
              <div class="meta-col">
                <div class="meta-label">Receipt No.</div>
                <div class="meta-value">#BKG-${String(booking.id).padStart(4, "0")}</div>
              </div>
              <div class="meta-col">
                <div class="meta-label">Date Paid</div>
                <div class="meta-value">${paidDate}</div>
              </div>
              <div class="meta-col">
                <div class="meta-label">Reserved Date & Slot</div>
                <div class="meta-value">${formattedBookingDate}</div>
                <div class="meta-sub">${booking.startTime} – ${booking.endTime}</div>
              </div>
            </div>

            <div class="meta-divider"></div>

            <!-- Billed to -->
            <div class="section-title">Reserved By</div>
            <div class="meta-grid" style="margin-bottom: 18px;">
              <div class="meta-col">
                <div class="meta-value">${residentName}</div>
                <div class="meta-sub">${residentEmail || residentPhone}</div>
              </div>
              <div class="meta-col">
                <div class="meta-value">Apartment ${aptLabel}</div>
                <div class="meta-sub">Booking Purpose: ${booking.purpose || "General Reservation"}</div>
              </div>
            </div>

            <!-- Charges -->
            <div class="section-title">Charge Details</div>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th style="width:75%">Amenity / Facility</th>
                  <th style="width:25%" class="amt">Fee Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${amenityName}</strong>
                    <div style="font-size:11px; color:#64748b; margin-top:2px;">
                      Slot: ${booking.startTime} to ${booking.endTime} (${formattedBookingDate})${attendeesText}
                    </div>
                  </td>
                  <td class="amt">₹${Number(amenityPrice).toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total Paid</td>
                  <td class="amt">₹${Number(amenityPrice).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment -->
            <div class="payment-box">
              <div class="row">
                <span class="label">Payment Reference</span>
                <span class="value">${paymentReference}</span>
              </div>
              <div class="row" style="margin-top:4px;">
                <span class="label">Payment Method</span>
                <span class="value">${paymentMethod}</span>
              </div>
            </div>

          </div>

          <!-- ─── FOOTER ─── -->
          <div class="footer">
            <strong>${env.SOCIETY_NAME}</strong> &mdash; This is a computer-generated booking receipt and does not require a physical signature.
          </div>

        </div>
      </div>
    </body>
    </html>
    `;
  }
}
