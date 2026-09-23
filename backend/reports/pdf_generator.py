import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(report_type: str, data: list, metadata: dict = None):
    metadata = metadata or {}
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=14
    )
    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#334155")
    )
    cell_header = ParagraphStyle(
        'CellHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )

    story = []
    
    # Title & Header
    title_text = f"Smart Library System: {report_type.replace('_', ' ').title()} Report"
    story.append(Paragraph(title_text, title_style))
    
    generated_at = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    sub_text = f"Generated: {generated_at} | Scope: Enterprise Library Management System"
    if metadata.get("filter"):
        sub_text += f" | Filter: {metadata.get('filter')}"
    story.append(Paragraph(sub_text, subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=14))

    if not data:
        story.append(Paragraph("No records found for the selected reporting parameters.", cell_style))
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    # Determine columns based on report_type
    headers = []
    rows = []

    if report_type in ["inventory", "books"]:
        headers = ["ISBN", "Title", "Category", "Shelf", "Total", "Avail", "Issued"]
        col_widths = [85, 170, 95, 60, 40, 40, 40]
        for item in data[:80]: # Limit for PDF page fit
            rows.append([
                Paragraph(str(item.get("isbn", "-")), cell_style),
                Paragraph(str(item.get("title", "-"))[:40], cell_style),
                Paragraph(str(item.get("category", "-")), cell_style),
                Paragraph(f"{item.get('shelf', '-')}/{item.get('rack', '-')}", cell_style),
                Paragraph(str(item.get("totalCopies", 0)), cell_style),
                Paragraph(str(item.get("availableCopies", 0)), cell_style),
                Paragraph(str(item.get("issuedCopies", 0)), cell_style)
            ])
    elif report_type in ["borrowing", "circulation", "overdue"]:
        headers = ["Tx ID", "Student / Member", "Book Title", "Issue Date", "Due Date", "Status"]
        col_widths = [75, 115, 150, 65, 65, 60]
        for item in data[:80]:
            rows.append([
                Paragraph(str(item.get("transactionId", "-")), cell_style),
                Paragraph(str(item.get("userName", "-")), cell_style),
                Paragraph(str(item.get("bookTitle", "-"))[:35], cell_style),
                Paragraph(str(item.get("issueDate", "-"))[:10], cell_style),
                Paragraph(str(item.get("dueDate", "-"))[:10], cell_style),
                Paragraph(str(item.get("status", "-")), cell_style)
            ])
    elif report_type in ["fines"]:
        headers = ["Tx ID", "Member", "Book Title", "Overdue Days", "Fine Amount", "Status"]
        col_widths = [85, 120, 160, 65, 50, 50]
        for item in data[:80]:
            rows.append([
                Paragraph(str(item.get("transactionId", "-")), cell_style),
                Paragraph(str(item.get("userName", "-")), cell_style),
                Paragraph(str(item.get("bookTitle", "-"))[:35], cell_style),
                Paragraph(str(item.get("overdueDays", 0)), cell_style),
                Paragraph(f"${item.get('fineAmount', 0):.2f}", cell_style),
                Paragraph(str(item.get("paymentStatus", "PENDING")), cell_style)
            ])
    else:
        # Generic table
        keys = list(data[0].keys())[:6]
        headers = [k.replace('_', ' ').title() for k in keys]
        col_widths = [530 // len(keys)] * len(keys)
        for item in data[:80]:
            rows.append([Paragraph(str(item.get(k, "-"))[:30], cell_style) for k in keys])

    table_data = [[Paragraph(h, cell_header) for h in headers]] + rows
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")])
    ]))

    story.append(t)
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"Total Records Included: {len(rows)} | Smart Library Analytics Engine", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
