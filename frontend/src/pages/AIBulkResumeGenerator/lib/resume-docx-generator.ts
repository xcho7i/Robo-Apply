import { Document, Paragraph, TextRun, AlignmentType, BorderStyle } from "docx";
import { marked } from "marked";

// Function to parse markdown content and convert to DOCX paragraphs
function parseMarkdownToDocxContent(markdownContent: string): Paragraph[] {
  const lines = markdownContent.split("\n");
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Add empty paragraph for spacing
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 1 })],
          spacing: { after: 120 },
        })
      );
      continue;
    }

    // Skip markdown indicators that shouldn't be rendered
    if (line === "markdown" || line === "---" || line.startsWith("```")) {
      continue;
    }

    // Handle headers (# ## ### etc.)
    if (line.startsWith("#")) {
      const headerLevel = line.match(/^#+/)?.[0].length || 1;
      const headerText = line.replace(/^#+\s*/, "");

      const isMainHeader = headerLevel <= 2;
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: headerText.toUpperCase(),
              size: isMainHeader ? 24 : 20,
              bold: true,
              color: "2D5AA0",
              font: "Arial",
            }),
          ],
          spacing: { before: isMainHeader ? 250 : 200, after: 150 },
          border: isMainHeader
            ? {
                bottom: {
                  color: "2D5AA0",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 3,
                },
              }
            : undefined,
        })
      );
      continue;
    }

    // Handle bullet points
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      const bulletText = line.replace(/^[•\-\*]\s*/, "");
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${bulletText}`,
              size: 20,
              color: "333333",
              font: "Arial",
            }),
          ],
          spacing: { after: 80 },
          indent: { left: 400 },
        })
      );
      continue;
    }

    // Handle bold text (**text**) and mixed formatting
    if (line.includes("**")) {
      const textRuns: TextRun[] = [];
      const parts = line.split(/(\*\*.*?\*\*)/g);

      for (const part of parts) {
        if (part.startsWith("**") && part.endsWith("**")) {
          // Bold text
          const boldText = part.slice(2, -2);
          if (boldText) {
            textRuns.push(
              new TextRun({
                text: boldText,
                size: 20,
                bold: true,
                color: "2D5AA0", // Use blue for bold text to make it stand out
                font: "Arial",
              })
            );
          }
        } else if (part.trim()) {
          // Regular text
          textRuns.push(
            new TextRun({
              text: part,
              size: 20,
              color: "333333",
              font: "Arial",
            })
          );
        }
      }

      if (textRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 80 },
          })
        );
      }
      continue;
    }

    // Handle regular text - check if it looks like a title/important info
    const isImportant =
      /^[A-Z][^a-z]*[A-Z][^a-z]*/.test(line) &&
      line.length < 80 &&
      !line.includes("•") &&
      !line.includes("|"); // Avoid table separators

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: isImportant ? 22 : 20,
            bold: isImportant,
            color: isImportant ? "2D5AA0" : "333333",
            font: "Arial",
          }),
        ],
        spacing: { after: 80 },
        alignment:
          line.length > 100 ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
      })
    );
  }

  return paragraphs;
}

export function createModernResumeDocument(
  content: string,
  jobTitle: string
): Document {
  // Enhanced markdown detection
  const isMarkdown =
    content.includes("#") ||
    content.includes("**") ||
    content.includes("•") ||
    content.includes("- ") ||
    content.includes("* ") ||
    content.includes("markdown") ||
    content.match(/^\s*#+\s/m) !== null; // Check for header patterns

  let parsedContent: Paragraph[];
  let name = "";

  if (isMarkdown) {
    // Parse markdown content
    parsedContent = parseMarkdownToDocxContent(content);

    // Try to extract name from first header or first line
    const contentLines = content.split("\n");
    for (const line of contentLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "markdown" || trimmed === "---") continue;

      if (trimmed.startsWith("#")) {
        name = trimmed.replace(/^#+\s*/, "");
        break;
      } else if (
        !trimmed.includes("*") &&
        !trimmed.includes("•") &&
        trimmed.length < 50 &&
        trimmed.length > 0
      ) {
        name = trimmed;
        break;
      }
    }
  } else {
    // Fallback to simple parsing for plain text
    const lines = content.split("\n").filter((line) => line.trim());
    name = lines[0]?.trim() || "";

    parsedContent = lines.slice(1).map((line) => {
      const trimmedLine = line.trim();

      // Check if line looks like a section header
      const isHeader =
        trimmedLine.length < 50 &&
        trimmedLine.toUpperCase() === trimmedLine &&
        trimmedLine.length > 5;

      if (isHeader) {
        return new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 24,
              bold: true,
              color: "2D5AA0",
              font: "Arial",
            }),
          ],
          spacing: { before: 250, after: 150 },
          border: {
            bottom: {
              color: "2D5AA0",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 3,
            },
          },
        });
      }

      // Check if line looks like a job title or important info
      const isImportant =
        /^[A-Z][^a-z]*[A-Z][^a-z]*/.test(trimmedLine) &&
        trimmedLine.length < 80;

      return new Paragraph({
        children: [
          new TextRun({
            text: trimmedLine,
            size: isImportant ? 22 : 20,
            bold: isImportant,
            color: isImportant ? "2D5AA0" : "333333",
            font: "Arial",
          }),
        ],
        spacing: { after: trimmedLine === "" ? 150 : 80 },
        alignment:
          trimmedLine.length > 100
            ? AlignmentType.JUSTIFIED
            : AlignmentType.LEFT,
      });
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: [
          // Professional header with name (only if we have a name)
          ...(name
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: name,
                      size: 36,
                      bold: true,
                      color: "2D5AA0", // Professional blue
                      font: "Arial",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                }),

                // Divider line
                new Paragraph({
                  children: [new TextRun({ text: "", size: 1 })],
                  border: {
                    bottom: {
                      color: "2D5AA0",
                      space: 1,
                      style: BorderStyle.SINGLE,
                      size: 6,
                    },
                  },
                  spacing: { after: 300 },
                }),
              ]
            : []),

          // Main content
          ...parsedContent,

          // Footer with tailoring info
          new Paragraph({
            children: [new TextRun({ text: "", size: 1 })],
            border: {
              top: {
                color: "CCCCCC",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 3,
              },
            },
            spacing: { before: 400, after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `✨ Modern Resume • Tailored for: ${jobTitle}`,
                size: 16,
                italics: true,
                color: "999999",
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return doc;
}
