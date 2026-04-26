// pdf.js — Professional purchase order bill generator

function generatePDF(order, settings) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const ML = 15, MR = 15;
  const CW = W - ML - MR; // content width = 180
  const cur = settings.currency || '₹';

  // ── Helpers ──────────────────────────────────────────
  function hline(y, x1, x2, lw, r, g, b) {
    doc.setDrawColor(r || 0, g || 0, b || 0);
    doc.setLineWidth(lw || 0.3);
    doc.line(x1 !== undefined ? x1 : ML, y, x2 !== undefined ? x2 : W - MR, y);
  }
  function box(x, y, w, h, fr, fg, fb) {
    doc.setFillColor(fr, fg, fb);
    doc.rect(x, y, w, h, 'F');
  }
  function txt(text, x, y, opts) {
    doc.text(String(text), x, y, opts || {});
  }

  let y = 0;

  // ── HEADER BAND ──────────────────────────────────────
  box(0, 0, W, 38, 22, 78, 160);           // dark blue band
  box(0, 38, W, 2, 251, 191, 36);          // gold accent line

  // Shop name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  txt(settings.shopName || 'Shop Name', ML, 13);

  // Shop sub-details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  const line1 = [settings.address].filter(Boolean).join('  ');
  const line2 = [settings.phone ? 'Ph: ' + settings.phone : '', settings.gstin ? 'GSTIN: ' + settings.gstin : ''].filter(Boolean).join('   |   ');
  if (line1) txt(line1, ML, 20);
  if (line2) txt(line2, ML, 26);

  // PO info — right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(251, 191, 36);
  txt('PURCHASE ORDER', W - MR, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  txt('PO Number : ' + order.poNumber,                   W - MR, 20, { align: 'right' });
  txt('Date          : ' + order.date,                   W - MR, 26, { align: 'right' });
  txt('Status        : ' + (order.status === 'received' ? 'Received' : 'Pending'), W - MR, 32, { align: 'right' });

  // Supplier name tag
  if (order.supplierName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36);
    txt('Supplier: ' + order.supplierName, W - MR, 38, { align: 'right' });
  }

  y = 46;

  // ── SUMMARY STRIP ────────────────────────────────────
  box(ML, y, CW, 12, 241, 245, 251);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const totalItems = order.items.length;
  const grandTotal = order.items.reduce((s, i) => s + (i.qtyOrdered * i.pricePerUnit), 0);
  txt('Total Items: ' + totalItems,                    ML + 4, y + 7.5);
  txt('Grand Total: ' + cur + grandTotal.toFixed(2),   ML + CW / 2, y + 7.5, { align: 'center' });
  txt('PO Date: ' + order.date,                        W - MR - 4, y + 7.5, { align: 'right' });

  y += 18;

  // ── TABLE HEADER ─────────────────────────────────────
  // Column layout
  const cols = [
    { label: '#',             x: ML,       w: 10  },
    { label: 'Item Name',     x: ML + 10,  w: 62  },
    { label: 'Unit',          x: ML + 72,  w: 18  },
    { label: 'Cur. Stock',    x: ML + 90,  w: 22  },
    { label: 'Order Qty',     x: ML + 112, w: 20  },
    { label: 'Price/Unit',    x: ML + 132, w: 24  },
    { label: 'Line Total',    x: ML + 156, w: 24  },
  ];

  // Header row
  box(ML, y, CW, 8, 22, 78, 160);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  cols.forEach(c => txt(c.label, c.x + 2, y + 5.5));
  y += 8;

  // ── TABLE ROWS ───────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  order.items.forEach((item, idx) => {
    const lineTotal = (item.qtyOrdered || 0) * (item.pricePerUnit || 0);
    const isOut  = (item.currentStock || 0) === 0;
    const isLow  = !isOut && (item.currentStock || 0) < 4;
    const rowH   = 8;

    // Alternating row bg
    if (idx % 2 === 0) {
      box(ML, y, CW, rowH, 248, 250, 252);
    }

    // Status color
    if (isOut)       doc.setTextColor(185, 28,  28);
    else if (isLow)  doc.setTextColor(180, 83,  9);
    else             doc.setTextColor(30,  41,  59);

    txt(String(idx + 1),                              cols[0].x + 2, y + 5.5);
    txt(String(item.itemName || '').slice(0, 30),     cols[1].x + 2, y + 5.5);
    txt(String(item.unit || ''),                      cols[2].x + 2, y + 5.5);
    txt(String(item.currentStock ?? ''),              cols[3].x + 2, y + 5.5);
    doc.setFont('helvetica', 'bold');
    txt(String(item.qtyOrdered || 0),                 cols[4].x + 2, y + 5.5);
    doc.setFont('helvetica', 'normal');
    txt(cur + Number(item.pricePerUnit || 0).toFixed(2), cols[5].x + 2, y + 5.5);
    txt(cur + lineTotal.toFixed(2),                   cols[6].x + 2, y + 5.5);

    // Bottom border per row
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(ML, y + rowH, W - MR, y + rowH);

    y += rowH;

    // Page break
    if (y > 255) {
      doc.addPage();
      y = 20;
    }
  });

  // Outer table border
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.rect(ML, 64, CW, y - 64, 'S');

  // ── TOTALS BLOCK ─────────────────────────────────────
  y += 4;
  const tbX = ML + CW - 80;

  // Subtotal row
  box(tbX, y, 80, 8, 241, 245, 251);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  txt('Subtotal:', tbX + 4, y + 5.5);
  txt(cur + grandTotal.toFixed(2), tbX + 76, y + 5.5, { align: 'right' });
  y += 8;

  // Grand total row
  box(tbX, y, 80, 10, 22, 78, 160);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  txt('GRAND TOTAL', tbX + 4, y + 7);
  txt(cur + grandTotal.toFixed(2), tbX + 76, y + 7, { align: 'right' });
  y += 16;

  // ── LEGEND ───────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(185, 28, 28);
  txt('● Out of stock', ML, y);
  doc.setTextColor(180, 83, 9);
  txt('● Low stock (< 4)', ML + 26, y);
  doc.setTextColor(100, 116, 139);
  txt('Items in red/orange require priority ordering.', ML + 68, y);
  y += 10;

  // ── SIGNATURE SECTION ────────────────────────────────
  const sigY = Math.max(y + 10, 245);

  box(ML, sigY - 4, CW, 28, 248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(ML, sigY - 4, CW, 28, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  txt('Authorized by:', ML + 6, sigY + 2);
  txt('Supplier Acknowledgement:', ML + CW / 2 + 4, sigY + 2);

  // Signature lines
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(ML + 6, sigY + 14, ML + 76, sigY + 14);
  doc.line(ML + CW / 2 + 4, sigY + 14, W - MR - 6, sigY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  txt('Shopkeeper Signature & Stamp', ML + 6, sigY + 19);
  txt('Supplier Signature & Date', ML + CW / 2 + 4, sigY + 19);

  // ── FOOTER ───────────────────────────────────────────
  box(0, H - 12, W, 12, 22, 78, 160);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 220, 255);
  txt('Generated by ShopOrder Management System  •  ' + order.poNumber + '  •  ' + order.date, W / 2, H - 5, { align: 'center' });

  const safeName = (order.supplierName || '').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = safeName
    ? 'PO_' + safeName + '_' + order.poNumber + '.pdf'
    : 'PurchaseOrder_' + order.poNumber + '.pdf';
  doc.save(filename);
}
