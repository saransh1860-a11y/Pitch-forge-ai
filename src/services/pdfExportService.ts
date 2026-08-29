import jsPDF from 'jspdf';
import { PitchProject, SlideData } from '../types/pitch';

// Category color mappings for PDF badges
const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  vision: [245, 158, 11], // amber
  problem: [239, 68, 68], // rose/red
  solution: [16, 185, 129], // emerald
  market: [99, 102, 241], // indigo
  product: [14, 165, 233], // sky
  business_model: [6, 182, 212], // cyan
  competition: [236, 72, 153], // pink
  traction: [168, 85, 247], // purple
  gtm: [249, 115, 22], // orange
  team_ask: [234, 179, 8], // yellow
};

export interface PdfExportOptions {
  includeSpeakerNotes?: boolean;
  includeScorecard?: boolean;
  includeVisualGuidance?: boolean;
}

const sanitizeText = (txt: string | undefined | null) => {
  if (!txt) return '';
  return txt.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[^\x00-\x7F]/g, ' ');
};

/**
 * Generates and downloads a clean, multi-page vector PDF deck for the given project.
 */
export async function downloadPitchDeckPdf(
  project: PitchProject,
  options: PdfExportOptions = {
    includeSpeakerNotes: true,
    includeScorecard: true,
    includeVisualGuidance: true,
  }
): Promise<void> {
  // 16:9 Landscape dimensions in mm (297 x 167 standard widescreen)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Helper for background & theme
  const drawSlideBackground = (isCover = false) => {
    // Dark modern slide background
    doc.setFillColor(15, 18, 26);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle header accent bar
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pageWidth, 2.5, 'F');

    if (!isCover) {
      // Top divider line
      doc.setDrawColor(40, 48, 66);
      doc.setLineWidth(0.3);
      doc.line(margin, 24, pageWidth - margin, 24);

      // Bottom footer line
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      // Footer branding & metadata
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 160);
      doc.text(`PitchForge AI  |  ${sanitizeText(project.intake.startupName)}`, margin, pageHeight - 6);
      doc.text('Confidential - Investor Presentation', pageWidth - margin, pageHeight - 6, { align: 'right' });
    }
  };

  // ==========================================
  // 1. COVER SLIDE
  // ==========================================
  drawSlideBackground(true);

  // Badge: Pitch Deck
  doc.setFillColor(35, 42, 60);
  doc.roundedRect(margin, 28, 48, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(245, 158, 11);
  doc.text('10-SLIDE INVESTOR DECK', margin + 4, 32.5);

  // Startup Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeText(project.intake.startupName), margin, 46);

  // Tagline / Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(220, 180, 80);
  const tagline = project.intake.tagline || project.intake.rawIdea;
  const wrappedTagline = doc.splitTextToSize(sanitizeText(tagline), contentWidth - 40);
  doc.text(wrappedTagline, margin, 56);

  // Key Metadata Boxes
  const boxY = 86;
  const boxWidth = (contentWidth - 12) / 4;
  const boxHeight = 26;

  const metadataItems = [
    { label: 'STAGE', value: project.intake.stage },
    { label: 'BUSINESS MODEL', value: project.intake.businessModel },
    { label: 'MARKET / REGION', value: project.intake.geography || 'Global' },
    {
      label: 'VC QUALITY SCORE',
      value: project.score ? `${project.score.overallScore}/100 (${project.score.tier})` : 'Evaluated',
    },
  ];

  metadataItems.forEach((item, idx) => {
    const x = margin + idx * (boxWidth + 4);
    doc.setFillColor(24, 30, 44);
    doc.setDrawColor(48, 58, 80);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 155, 180);
    doc.text(item.label, x + 4, boxY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const wrappedVal = doc.splitTextToSize(sanitizeText(item.value), boxWidth - 8);
    doc.text(wrappedVal, x + 4, boxY + 15);
  });

  // Problem vs Solution Preview
  const problemBoxY = 120;
  const halfBoxWidth = (contentWidth - 6) / 2;

  // Core Problem Summary
  doc.setFillColor(24, 30, 44);
  doc.roundedRect(margin, problemBoxY, halfBoxWidth, 30, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(239, 68, 68);
  doc.text('CORE PROBLEM', margin + 5, problemBoxY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(210, 220, 235);
  const probText = project.analysis?.coreProblem || project.intake.problem;
  doc.text(doc.splitTextToSize(sanitizeText(probText), halfBoxWidth - 10), margin + 5, problemBoxY + 14);

  // Core Solution Summary
  const solX = margin + halfBoxWidth + 6;
  doc.setFillColor(24, 30, 44);
  doc.roundedRect(solX, problemBoxY, halfBoxWidth, 30, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129);
  doc.text('VALUE PROPOSITION', solX + 5, problemBoxY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(210, 220, 235);
  const solText = project.analysis?.valueProposition || project.intake.solution;
  doc.text(doc.splitTextToSize(sanitizeText(solText), halfBoxWidth - 10), solX + 5, problemBoxY + 14);

  // ==========================================
  // 2. THE 10 SLIDES
  // ==========================================
  project.slides.forEach((slide) => {
    doc.addPage();
    drawSlideBackground(false);

    // Slide Category Badge
    const categoryColor = CATEGORY_COLORS[slide.category] || [245, 158, 11];
    doc.setFillColor(categoryColor[0], categoryColor[1], categoryColor[2]);
    doc.roundedRect(margin, 8, 38, 6, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 18, 26);
    doc.text(
      `SLIDE ${slide.slideNumber} • ${slide.category.toUpperCase().replace('_', ' ')}`,
      margin + 3,
      12.2
    );

    // Slide Counter
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(160, 175, 195);
    doc.text(`Slide ${slide.slideNumber} of ${project.slides.length}`, pageWidth - margin, 12.5, {
      align: 'right',
    });

    // Slide Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizeText(slide.title), margin, 20);

    // Slide 1-Second Takeaway Headline
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(245, 180, 80);
    const wrappedHeadline = doc.splitTextToSize(`"${sanitizeText(slide.headline)}"`, contentWidth);
    doc.text(wrappedHeadline, margin, 30);

    // Two Column Body Layout
    const bodyY = 38;
    const colWidth = (contentWidth - 8) / 2;

    // LEFT COLUMN: Key Narrative Bullets
    doc.setFillColor(22, 27, 40);
    doc.setDrawColor(44, 54, 76);
    doc.setLineWidth(0.3);
    const bulletsBoxHeight = options.includeSpeakerNotes ? 68 : 98;
    doc.roundedRect(margin, bodyY, colWidth, bulletsBoxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11);
    doc.text('KEY ARGUMENTS & EVIDENCE', margin + 5, bodyY + 7);

    let bulletY = bodyY + 14;
    slide.bullets.forEach((bullet) => {
      // Checkmark icon
      doc.setFillColor(16, 185, 129);
      doc.circle(margin + 7, bulletY - 1, 1.5, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(230, 235, 245);
      const splitBullet = doc.splitTextToSize(sanitizeText(bullet), colWidth - 18);
      doc.text(splitBullet, margin + 12, bulletY);
      bulletY += splitBullet.length * 4.2 + 2.5;
    });

    // RIGHT COLUMN: Key Metrics & Data Points
    const rightColX = margin + colWidth + 8;
    doc.setFillColor(22, 27, 40);
    doc.setDrawColor(44, 54, 76);
    doc.roundedRect(rightColX, bodyY, colWidth, bulletsBoxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(99, 102, 241);
    doc.text('QUANTITATIVE DATA POINTS & VALIDATION', rightColX + 5, bodyY + 7);

    // Render Metrics inside right column
    const metricCardWidth = (colWidth - 12) / 2;
    const metricCardHeight = 18;

    slide.keyDataPoints.forEach((dp, dpIdx) => {
      const row = Math.floor(dpIdx / 2);
      const col = dpIdx % 2;
      const cardX = rightColX + 4 + col * (metricCardWidth + 4);
      const cardY = bodyY + 12 + row * (metricCardHeight + 3);

      doc.setFillColor(16, 21, 32);
      doc.setDrawColor(55, 68, 92);
      doc.roundedRect(cardX, cardY, metricCardWidth, metricCardHeight, 2, 2, 'FD');

      // Metric Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(140, 155, 175);
      doc.text(sanitizeText(dp.label), cardX + 3, cardY + 5);

      // Metric Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(sanitizeText(dp.value), cardX + 3, cardY + 11);

      // Status Pill
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      if (dp.status === 'validated') {
        doc.setTextColor(16, 185, 129);
      } else if (dp.status === 'assumption') {
        doc.setTextColor(245, 158, 11);
      } else {
        doc.setTextColor(129, 140, 248);
      }
      doc.text(dp.status.toUpperCase(), cardX + 3, cardY + 15.5);
    });

    // Visual Layout Guidance inside right column bottom
    if (options.includeVisualGuidance) {
      const visY = bodyY + 12 + 2 * (metricCardHeight + 3) + 2;
      doc.setFillColor(16, 21, 32);
      doc.roundedRect(rightColX + 4, visY, colWidth - 8, 16, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(129, 140, 248);
      doc.text('VISUAL LAYOUT GUIDANCE:', rightColX + 7, visY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(200, 210, 225);
      const wrappedVis = doc.splitTextToSize(
        sanitizeText(slide.visualRecommendation.description),
        colWidth - 14
      );
      doc.text(wrappedVis, rightColX + 7, visY + 10);
    }

    // SPEAKER SCRIPT (BOTTOM PANEL)
    if (options.includeSpeakerNotes) {
      const notesY = bodyY + bulletsBoxHeight + 4;
      const notesHeight = 32;

      doc.setFillColor(20, 24, 36);
      doc.setDrawColor(44, 54, 76);
      doc.roundedRect(margin, notesY, contentWidth, notesHeight, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(245, 158, 11);
      doc.text('FOUNDER SPEAKER SCRIPT (60-90 SECONDS):', margin + 5, notesY + 6);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(215, 225, 240);
      const splitScript = doc.splitTextToSize(`"${sanitizeText(slide.speakerNotes)}"`, contentWidth - 12);
      doc.text(splitScript, margin + 5, notesY + 12);
    }
  });

  // ==========================================
  // 3. VC CRITIQUE & SCORECARD SLIDE
  // ==========================================
  if (options.includeScorecard && (project.score || project.critique)) {
    doc.addPage();
    drawSlideBackground(false);

    // Header
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, 8, 52, 6, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('INVESTMENT COMMITTEE REVIEW', margin + 3, 12.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('VC Quality Scorecard & 60-Second Investor Verdict', margin, 20);

    const critiqueY = 28;
    const halfWidth = (contentWidth - 8) / 2;

    // Left: Score Breakdown
    if (project.score) {
      doc.setFillColor(22, 27, 40);
      doc.setDrawColor(44, 54, 76);
      doc.roundedRect(margin, critiqueY, halfWidth, 118, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(245, 158, 11);
      doc.text(`OVERALL SCORE: ${project.score.overallScore}/100 (${project.score.tier})`, margin + 6, critiqueY + 8);

      let rowY = critiqueY + 16;
      Object.entries(project.score.categories).forEach(([key, val]: [string, any]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(200, 210, 230);
        doc.text(key.replace(/([A-Z])/g, ' $1').toUpperCase(), margin + 6, rowY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        const scorePercent = (val.score / (val.maxScore || 10)) * 10;
        if (scorePercent >= 8) doc.setTextColor(16, 185, 129);
        else if (scorePercent >= 6) doc.setTextColor(245, 158, 11);
        else doc.setTextColor(239, 68, 68);
        doc.text(`${val.score}/${val.maxScore || 10}`, margin + halfWidth - 6, rowY, { align: 'right' });

        // Bar representation
        doc.setFillColor(35, 45, 65);
        doc.roundedRect(margin + 6, rowY + 1.5, halfWidth - 12, 2, 1, 1, 'F');
        doc.setFillColor(scorePercent >= 8 ? 16 : 245, scorePercent >= 8 ? 185 : 158, scorePercent >= 8 ? 129 : 11);
        doc.roundedRect(margin + 6, rowY + 1.5, ((halfWidth - 12) * scorePercent) / 10, 2, 1, 1, 'F');

        rowY += 12;
      });
    }

    // Right: VC Verdict & Risks
    if (project.critique) {
      const rightX = margin + halfWidth + 8;
      doc.setFillColor(22, 27, 40);
      doc.setDrawColor(44, 54, 76);
      doc.roundedRect(rightX, critiqueY, halfWidth, 118, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text('60-SECOND PARTNER VERDICT:', rightX + 6, critiqueY + 8);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      const verdict = doc.splitTextToSize(`"${sanitizeText(project.critique.sixtySecondVerdict)}"`, halfWidth - 12);
      doc.text(verdict, rightX + 6, critiqueY + 15);

      // Strengths & Risks
      const block2Y = critiqueY + 38;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text('STRONGEST PART OF PITCH:', rightX + 6, block2Y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(215, 225, 240);
      doc.text(
        doc.splitTextToSize(sanitizeText(project.critique.strongestPart), halfWidth - 12),
        rightX + 6,
        block2Y + 5
      );

      const block3Y = critiqueY + 64;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(239, 68, 68);
      doc.text('BIGGEST UNANSWERED QUESTION:', rightX + 6, block3Y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(215, 225, 240);
      doc.text(
        doc.splitTextToSize(sanitizeText(project.critique.biggestUnansweredQuestion), halfWidth - 12),
        rightX + 6,
        block3Y + 5
      );

      const block4Y = critiqueY + 90;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(245, 158, 11);
      doc.text('EXISTENTIAL INVESTMENT RISK:', rightX + 6, block4Y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(215, 225, 240);
      doc.text(
        doc.splitTextToSize(sanitizeText(project.critique.biggestInvestmentRisk), halfWidth - 12),
        rightX + 6,
        block4Y + 5
      );
    }
  }

  // Safe filename
  const cleanName = (project.intake.startupName || 'Pitch')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  doc.save(`${cleanName}_pitch_deck.pdf`);
}

/**
 * Generates and downloads a clean, high-impact 1-Page Executive Memo / Deal Sheet in vector PDF.
 */
export async function downloadOnePagerPdf(project: PitchProject): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Background
  doc.setFillColor(15, 18, 26);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header accent line
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // HEADER BLOCK
  doc.setFillColor(22, 27, 40);
  doc.setDrawColor(44, 54, 76);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, 8, contentWidth, 28, 2.5, 2.5, 'FD');

  // Badge: Executive Summary
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(margin + 4, 11.5, 42, 5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 18, 26);
  doc.text('EXECUTIVE DEAL MEMO', margin + 6, 15);

  // Score Pill in header
  if (project.score) {
    doc.setFillColor(35, 45, 65);
    doc.roundedRect(pageWidth - margin - 46, 11.5, 42, 5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(245, 158, 11);
    doc.text(`SCORE: ${project.score.overallScore}/100 (${project.score.tier})`, pageWidth - margin - 44, 15);
  }

  // Startup Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeText(project.intake.startupName), margin + 4, 23);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 210, 230);
  const tagline = project.intake.tagline || project.intake.rawIdea || 'Evidence-First Startup Pitch';
  const wrappedTagline = doc.splitTextToSize(sanitizeText(tagline), contentWidth - 8);
  doc.text(wrappedTagline, margin + 4, 30);

  // QUICK METADATA STRIP
  const metaY = 38;
  const metaColWidth = (contentWidth - 6) / 3;
  const metaHeight = 11;

  const metadata = [
    { label: 'STAGE / GEOGRAPHY', val: `${project.intake.stage} • ${project.intake.geography || 'Global'}` },
    { label: 'BUSINESS MODEL', val: project.intake.businessModel || 'B2B SaaS' },
    {
      label: 'TARGET MARKET',
      val: project.analysis?.marketOpportunity?.tamEstimate
        ? `TAM: ${project.analysis.marketOpportunity.tamEstimate}`
        : project.intake.targetCustomer || 'Enterprise',
    },
  ];

  metadata.forEach((m, idx) => {
    const x = margin + idx * (metaColWidth + 3);
    doc.setFillColor(20, 24, 36);
    doc.setDrawColor(44, 54, 76);
    doc.roundedRect(x, metaY, metaColWidth, metaHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(140, 155, 175);
    doc.text(m.label, x + 3, metaY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(245, 158, 11);
    const splitVal = doc.splitTextToSize(sanitizeText(m.val), metaColWidth - 6);
    doc.text(splitVal[0] || '', x + 3, metaY + 8.5);
  });

  // MAIN BODY - 2 COLUMN GRID
  let currentY = 52;
  const halfColWidth = (contentWidth - 5) / 2;

  // Helper box renderer
  const renderCard = (
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    titleColor: [number, number, number],
    contentLines: string[],
    bullets?: string[]
  ) => {
    doc.setFillColor(22, 27, 40);
    doc.setDrawColor(44, 54, 76);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    doc.text(title.toUpperCase(), x + 4, y + 6);

    let innerY = y + 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(215, 225, 240);

    contentLines.forEach((line) => {
      const split = doc.splitTextToSize(sanitizeText(line), w - 8);
      doc.text(split, x + 4, innerY);
      innerY += split.length * 3.5 + 1;
    });

    if (bullets && bullets.length > 0) {
      bullets.forEach((b) => {
        doc.setFillColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.circle(x + 5, innerY - 0.8, 1, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(215, 225, 240);
        const splitB = doc.splitTextToSize(sanitizeText(b), w - 12);
        doc.text(splitB, x + 8, innerY);
        innerY += splitB.length * 3.5 + 1.2;
      });
    }
  };

  // Row 1: Problem & Solution
  const row1Height = 44;
  const probSlide = project.slides.find((s) => s.category === 'problem');
  const probText = project.analysis?.coreProblem || project.intake.problem || 'Pain points identified in current workflow.';
  renderCard(
    margin,
    currentY,
    halfColWidth,
    row1Height,
    '1. The Problem & Pain Point',
    [239, 68, 68],
    [probText],
    probSlide ? probSlide.bullets.slice(0, 2) : undefined
  );

  const solSlide = project.slides.find((s) => s.category === 'solution');
  const solText = project.analysis?.valueProposition || project.intake.solution || 'Differentiated proprietary solution.';
  renderCard(
    margin + halfColWidth + 5,
    currentY,
    halfColWidth,
    row1Height,
    '2. Solution & Value Proposition',
    [16, 185, 129],
    [solText],
    solSlide ? solSlide.bullets.slice(0, 2) : undefined
  );

  currentY += row1Height + 4;

  // Row 2: Market & Business Model
  const row2Height = 44;
  const marketSlide = project.slides.find((s) => s.category === 'market');
  const marketText = project.analysis?.marketOpportunity
    ? `TAM: ${project.analysis.marketOpportunity.tamEstimate || 'N/A'} | SAM: ${project.analysis.marketOpportunity.samEstimate || 'N/A'} | SOM: ${project.analysis.marketOpportunity.somEstimate || 'N/A'}`
    : `Target Customer: ${project.intake.targetCustomer || 'High value market segment'}`;
  renderCard(
    margin,
    currentY,
    halfColWidth,
    row2Height,
    '3. Market Opportunity & Sizing',
    [99, 102, 241],
    [marketText],
    marketSlide ? marketSlide.bullets.slice(0, 2) : undefined
  );

  const bizSlide = project.slides.find((s) => s.category === 'business_model');
  const bizText = project.analysis?.businessModel || project.intake.businessModel || project.intake.revenueModel || 'Recurring monetization engine.';
  renderCard(
    margin + halfColWidth + 5,
    currentY,
    halfColWidth,
    row2Height,
    '4. Business Model & Monetization',
    [14, 165, 233],
    [bizText],
    bizSlide ? bizSlide.bullets.slice(0, 2) : undefined
  );

  currentY += row2Height + 4;

  // Row 3: Traction & Competitive Advantage
  const row3Height = 44;
  const tracSlide = project.slides.find((s) => s.category === 'traction');
  const tracText = project.intake.existingTraction || 'Early adoption and customer interest with validated engagement.';
  renderCard(
    margin,
    currentY,
    halfColWidth,
    row3Height,
    '5. Traction & Key Milestones',
    [168, 85, 247],
    [tracText],
    tracSlide ? tracSlide.bullets.slice(0, 2) : undefined
  );

  const compSlide = project.slides.find((s) => s.category === 'competition');
  const moatText = project.analysis?.differentiation || project.intake.competitiveAdvantage || 'Defensible product architecture.';
  renderCard(
    margin + halfColWidth + 5,
    currentY,
    halfColWidth,
    row3Height,
    '6. Competitive Advantage & Moat',
    [236, 72, 153],
    [moatText],
    compSlide ? compSlide.bullets.slice(0, 2) : undefined
  );

  currentY += row3Height + 4;

  // Row 4: Team, The Ask & VC Investment Verdict
  const row4Height = 54;
  const askSlide = project.slides.find((s) => s.category === 'team_ask');

  // Left: The Ask & Team
  const askContent = [
    `Team: ${project.intake.teamInfo || (askSlide ? askSlide.bullets.join(', ') : 'Founding team with domain expertise.')}`,
    `Milestones: ${askSlide ? askSlide.headline : '18-month roadmap to scale core KPIs.'}`,
  ];
  renderCard(
    margin,
    currentY,
    halfColWidth,
    row4Height,
    '7. Team & Capital Requirements',
    [234, 179, 8],
    askContent,
    askSlide ? askSlide.bullets.slice(0, 2) : undefined
  );

  // Right: VC Verdict & Risk Analysis
  const vcContent = project.critique
    ? [
        `60-Sec Verdict: "${sanitizeText(project.critique.sixtySecondVerdict)}"`,
        `Strongest Asset: ${sanitizeText(project.critique.strongestPart)}`,
        `Key Risk: ${sanitizeText(project.critique.biggestInvestmentRisk)}`,
      ]
    : [
        'Institutional quality analysis completed.',
        'Narrative evaluated across 8 VC dimensions with institutional venture capital rubrics.',
      ];

  renderCard(
    margin + halfColWidth + 5,
    currentY,
    halfColWidth,
    row4Height,
    '8. VC Review & Risk Evaluation',
    [245, 158, 11],
    vcContent
  );

  // Footer bar
  doc.setDrawColor(40, 48, 66);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(130, 140, 160);
  doc.text(`PitchForge AI  |  1-Page Executive Deal Memo  |  ${sanitizeText(project.intake.startupName)}`, margin, pageHeight - 6);
  doc.text('Strictly Confidential • Investor Brief', pageWidth - margin, pageHeight - 6, { align: 'right' });

  // Save PDF
  const cleanName = (project.intake.startupName || 'Pitch')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  doc.save(`${cleanName}_executive_memo.pdf`);
}

/**
 * Generates and downloads a self-contained offline HTML presentation file (10-Slide Deck).
 */
export function downloadStandaloneHtmlPresentation(project: PitchProject): void {
  const cleanName = (project.intake.startupName || 'Pitch')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.intake.startupName} - Investor Pitch Deck</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: landscape; margin: 10mm; }
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
      .slide-card { page-break-after: always !important; break-after: page !important; min-height: 85vh; border: 1px solid #ddd !important; }
    }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen font-sans p-6 sm:p-10">
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between no-print border-b border-zinc-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-white">${project.intake.startupName} - Pitch Deck</h1>
        <p class="text-xs text-zinc-400">Exported from PitchForge AI • 10-Slide Deck Package</p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="window.print()" class="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </div>

    <!-- Presentation Body -->
    <div class="space-y-8">
      ${project.slides
        .map(
          (s) => `
        <div class="slide-card rounded-2xl bg-zinc-900 border border-zinc-800 p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span class="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 text-xs font-bold uppercase">
              Slide ${s.slideNumber} • ${s.category.replace('_', ' ')}
            </span>
            <span class="text-xs text-zinc-400 font-bold">${project.intake.startupName}</span>
          </div>

          <div class="space-y-1">
            <h2 class="text-2xl font-bold text-white">${s.title}</h2>
            <p class="text-sm font-medium text-amber-400 italic">"${s.headline}"</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Core Narrative:</span>
              <ul class="space-y-2 text-xs text-zinc-300">
                ${s.bullets.map((b) => `<li class="flex items-start gap-2"><span class="text-amber-400 font-bold">✓</span> <span>${b}</span></li>`).join('')}
              </ul>
            </div>

            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Key Data Points:</span>
              <div class="grid grid-cols-2 gap-2">
                ${s.keyDataPoints
                  .map(
                    (dp) => `
                  <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span class="text-[10px] text-zinc-400 block">${dp.label}</span>
                    <strong class="text-xs text-white block">${dp.value}</strong>
                    <span class="text-[9px] uppercase font-bold text-amber-400">${dp.status}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <div class="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 text-xs">
            <strong class="text-amber-400 block text-[10px] uppercase">Speaker Script:</strong>
            <p class="text-zinc-300 italic mt-1">"${s.speakerNotes}"</p>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${cleanName}_presentation.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a self-contained offline HTML 1-Page Executive Memo.
 */
export function downloadOnePagerHtml(project: PitchProject): void {
  const cleanName = (project.intake.startupName || 'Pitch')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();

  const probSlide = project.slides.find((s) => s.category === 'problem');
  const solSlide = project.slides.find((s) => s.category === 'solution');
  const marketSlide = project.slides.find((s) => s.category === 'market');
  const bizSlide = project.slides.find((s) => s.category === 'business_model');
  const tracSlide = project.slides.find((s) => s.category === 'traction');
  const compSlide = project.slides.find((s) => s.category === 'competition');
  const askSlide = project.slides.find((s) => s.category === 'team_ask');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.intake.startupName} - 1-Page Executive Memo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: portrait; margin: 12mm; }
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen font-sans p-6 sm:p-10">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between no-print border-b border-zinc-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-white">${project.intake.startupName}</h1>
        <p class="text-xs text-zinc-400">1-Page Investor Executive Deal Memo</p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="window.print()" class="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </div>

    <!-- Memo Container -->
    <div class="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 space-y-6 shadow-2xl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <span class="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-0.5 text-[11px] font-bold uppercase">
            Executive Deal Memo
          </span>
          <h2 class="text-3xl font-extrabold text-white mt-1">${project.intake.startupName}</h2>
          <p class="text-sm text-zinc-300 italic mt-0.5">${project.intake.tagline || project.intake.rawIdea}</p>
        </div>
        <div class="text-right">
          <span class="text-xs text-zinc-400 block">${project.intake.stage} • ${project.intake.geography || 'Global'}</span>
          ${
            project.score
              ? `<span class="text-xs font-bold text-amber-400 block mt-1">VC Score: ${project.score.overallScore}/100 (${project.score.tier})</span>`
              : ''
          }
        </div>
      </div>

      <!-- Core 2x3 Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <strong class="text-rose-400 font-bold uppercase tracking-wider block text-[11px]">1. Problem & Pain Points</strong>
          <p class="text-zinc-300 leading-relaxed">${project.analysis?.coreProblem || project.intake.problem}</p>
          ${probSlide ? `<ul class="space-y-1 text-zinc-400 mt-2">${probSlide.bullets.slice(0, 2).map((b) => `<li>• ${b}</li>`).join('')}</ul>` : ''}
        </div>

        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <strong class="text-emerald-400 font-bold uppercase tracking-wider block text-[11px]">2. Solution & Value Prop</strong>
          <p class="text-zinc-300 leading-relaxed">${project.analysis?.valueProposition || project.intake.solution}</p>
          ${solSlide ? `<ul class="space-y-1 text-zinc-400 mt-2">${solSlide.bullets.slice(0, 2).map((b) => `<li>• ${b}</li>`).join('')}</ul>` : ''}
        </div>

        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <strong class="text-indigo-400 font-bold uppercase tracking-wider block text-[11px]">3. Market Opportunity</strong>
          <p class="text-zinc-300 leading-relaxed">
            ${
              project.analysis?.marketOpportunity?.tamEstimate
                ? `TAM: ${project.analysis.marketOpportunity.tamEstimate} | SAM: ${project.analysis.marketOpportunity.samEstimate || 'N/A'} | SOM: ${project.analysis.marketOpportunity.somEstimate || 'N/A'}`
                : project.intake.targetCustomer
            }
          </p>
          ${marketSlide ? `<ul class="space-y-1 text-zinc-400 mt-2">${marketSlide.bullets.slice(0, 2).map((b) => `<li>• ${b}</li>`).join('')}</ul>` : ''}
        </div>

        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <strong class="text-sky-400 font-bold uppercase tracking-wider block text-[11px]">4. Business Model & Monetization</strong>
          <p class="text-zinc-300 leading-relaxed">${project.analysis?.businessModel || project.intake.businessModel}</p>
          ${bizSlide ? `<ul class="space-y-1 text-zinc-400 mt-2">${bizSlide.bullets.slice(0, 2).map((b) => `<li>• ${b}</li>`).join('')}</ul>` : ''}
        </div>

        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <strong class="text-purple-400 font-bold uppercase tracking-wider block text-[11px]">5. Traction & Validation</strong>
          <p class="text-zinc-300 leading-relaxed">${project.intake.existingTraction || 'Early validation & key customer momentum.'}</p>
          ${tracSlide ? `<ul class="space-y-1 text-zinc-400 mt-2">${tracSlide.bullets.slice(0, 2).map((b) => `<li>• ${b}</li>`).join('')}</ul>` : ''}
        </div>

        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <strong class="text-pink-400 font-bold uppercase tracking-wider block text-[11px]">6. Competitive Moat</strong>
          <p class="text-zinc-300 leading-relaxed">${project.analysis?.differentiation || project.intake.competitiveAdvantage || 'Defensible product architecture.'}</p>
          ${compSlide ? `<ul class="space-y-1 text-zinc-400 mt-2">${compSlide.bullets.slice(0, 2).map((b) => `<li>• ${b}</li>`).join('')}</ul>` : ''}
        </div>
      </div>

      <!-- Bottom Panel: Team & VC Review -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-zinc-800">
        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
          <strong class="text-yellow-400 font-bold uppercase tracking-wider block text-[11px]">Team & Capital Ask</strong>
          <p class="text-zinc-300">${project.intake.teamInfo || 'Founding team with deep domain experience.'}</p>
          <p class="text-zinc-400 font-medium">${askSlide ? askSlide.headline : '18-month roadmap to achieve scale milestones.'}</p>
        </div>

        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
          <strong class="text-amber-400 font-bold uppercase tracking-wider block text-[11px]">VC Investment Verdict</strong>
          <p class="text-zinc-200 font-semibold italic">"${project.critique?.sixtySecondVerdict || 'Strong institutional readiness.'}"</p>
          ${project.critique ? `<p class="text-zinc-400 text-[10px]"><strong>Key Asset:</strong> ${project.critique.strongestPart}</p>` : ''}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${cleanName}_executive_memo.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
