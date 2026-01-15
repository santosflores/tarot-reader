const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
} = require("docx");

// Define styles
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: "Arial",
          size: 24, // 12pt
        },
      },
    },
  },
  sections: [
    {
      children: [
        // Title
        new Paragraph({
          text: "Business Model & Pricing Strategy: Conversational Tarot Reader",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),

        // Alert/Intro
        new Paragraph({
          children: [
            new TextRun({
              text: "Core Constraint: ",
              bold: true,
            }),
            new TextRun(
              "The ElevenLabs Agent platform operates on a usage-based cost model (billed per minute). A pure 'unlimited' subscription is financially dangerous; a usage-based or credit-based model is required."
            ),
          ],
          spacing: { after: 300 },
        }),

        // Section 1: Unit Economics
        new Paragraph({
          text: '1. Unit Economics (The "Cost of Goods Sold")',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        }),
        new Paragraph({
          text: "We must understand the cost of a single 'unit' of service (a Tarot Reading).",
          spacing: { after: 150 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• ElevenLabs Voice Processing: ",
              bold: true,
            }),
            new TextRun("~$0.10 per minute"),
          ],
          bullet: { level: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• LLM Intelligence Overhead: ", bold: true }),
            new TextRun("~20% of voice cost"),
          ],
          bullet: { level: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Total Variable Cost: ", bold: true }),
            new TextRun({
              text: "~$0.12 per minute of conversation.",
              bold: true,
            }),
          ],
          bullet: { level: 0 },
          spacing: { after: 300 },
        }),

        // Table: Session Types
        new Paragraph({
          text: "Session Types & Costs:",
          bold: true,
          spacing: { after: 100 },
        }),
        new Table({
          columnWidths: [3500, 2500, 2500],
          rows: [
            // Header
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ text: "Session Type", bold: true }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: "Duration (Avg)", bold: true }),
                  ],
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Est. Cost", bold: true })],
                }),
              ],
            }),
            // Row 1
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Daily Card Pull")] }),
                new TableCell({ children: [new Paragraph("2 Minutes")] }),
                new TableCell({ children: [new Paragraph("$0.24")] }),
              ],
            }),
            // Row 2
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("3-Card Clarity Spread")],
                }),
                new TableCell({ children: [new Paragraph("5 Minutes")] }),
                new TableCell({ children: [new Paragraph("$0.60")] }),
              ],
            }),
            // Row 3
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Celtic Cross / Deep Dive")],
                }),
                new TableCell({ children: [new Paragraph("15 Minutes")] }),
                new TableCell({ children: [new Paragraph("$1.80")] }),
              ],
            }),
          ],
        }),
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        }),

        // Section 2: Mystic Credits System
        new Paragraph({
          text: '2. The "Mystic Credits" System (Proposal)',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        }),
        new Paragraph({
          text: 'A pure Pay-As-You-Go model. Users purchase one-time "Packs" of credits. No recurring subscriptions.',
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: "Credit Packs:",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        }),

        // Pack 1
        new Paragraph({
          text: "1. Spark Pack (Entry) - $4.99",
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          text: "• 500 Credits (~50 mins)",
          bullet: { level: 0 },
        }),
        new Paragraph({
          text: "• Perfect for trying out usage.",
          bullet: { level: 0 },
          spacing: { after: 150 },
        }),

        // Pack 2
        new Paragraph({
          text: "2. Cosmic Pack (Standard) - $14.99",
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          text: "• 2,000 Credits (~200 mins)",
          bullet: { level: 0 },
        }),
        new Paragraph({
          text: "• Best value for regular users.",
          bullet: { level: 0 },
          spacing: { after: 150 },
        }),

        // Pack 3
        new Paragraph({
          text: "3. Infinity Pack (Best Value) - $29.99",
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          text: "• 5,000 Credits (~500 mins)",
          bullet: { level: 0 },
        }),
        new Paragraph({
          text: "• For power users.",
          bullet: { level: 0 },
          spacing: { after: 150 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Credit Rate: ", bold: true }),
            new TextRun("10 Credits = 1 Minute of Conversation."),
          ],
          spacing: { before: 150, after: 300 },
        }),

        // Section 3: Pricing Strategy
        new Paragraph({
          text: "3. Pricing Strategy & Reasoning",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Transparency: ", bold: true }),
            new TextRun(
              "Show timer or 'Credits Remaining' so they don't feel cheated."
            ),
          ],
          bullet: { level: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Capped Downside: ", bold: true }),
            new TextRun(
              "The credit model ensures you never have a user who costs more than they pay."
            ),
          ],
          bullet: { level: 0 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Cash Flow: ", bold: true }),
            new TextRun(
              "Pre-paid credits give you cash upfront to pay API bills."
            ),
          ],
          bullet: { level: 0 },
        }),
      ],
    },
  ],
});

// Save document
Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(
      "/Users/santosflores/.gemini/antigravity/brain/80070015-fd46-4415-a540-2641deff6a9c/Business_Model.docx",
      buffer
    );
    console.log("Document created successfully at Business_Model.docx");
  })
  .catch((err) => {
    console.error("Error creating document:", err);
  });
