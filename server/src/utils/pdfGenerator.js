// Utility to generate a valid, standard PDF-1.4 verification document stream
export function buildValidPdf({
  title = 'Educational Qualification Document',
  candidateName = 'Registered Tutor',
  applicationId = 'SL-TUT-VERIFIED',
  docType = 'Degree / Qualification Certificate',
  originalName = 'verification_document.pdf',
  uploadedAt = new Date(),
  verificationStatus = 'Pending Verification'
} = {}) {
  const dateStr = new Date(uploadedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const lines = [
    'SHIKSHALINK - VERIFIED EDUCATIONAL RECORD',
    '============================================================',
    '',
    `Document Title:      ${title}`,
    `Original Filename:   ${originalName}`,
    `Document Category:   ${docType.toUpperCase()}`,
    `Candidate Name:      ${candidateName}`,
    `Application ID:      ${applicationId}`,
    `Upload Timestamp:    ${dateStr}`,
    `Verification Status: ${verificationStatus.toUpperCase()}`,
    '',
    '------------------------------------------------------------',
    'OFFICIAL VERIFICATION SUMMARY & AUDIT TRAIL',
    '------------------------------------------------------------',
    '1. This confidential record was submitted via ShikshaLink Tutor Portal.',
    '2. Institutional identity and degree validity are audited by ShikshaLink Admin.',
    '3. For real-time verification and badge endorsement, review Admin Console.',
    '',
    'ShikshaLink Education Network - Quality Home & Online Tuition Platform',
    'support@shikshalink.com | www.shikshalink.com',
    '============================================================'
  ];

  let streamContent = 'BT\n/F1 12 Tf\n50 720 Td\n18 TL\n';
  for (const line of lines) {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    if (line.startsWith('SHIKSHALINK') || line.startsWith('OFFICIAL')) {
      streamContent += `/F2 13 Tf\n(${escaped}) Tj\nT*\n/F1 11 Tf\n`;
    } else {
      streamContent += `(${escaped}) Tj\nT*\n`;
    }
  }
  streamContent += 'ET\n';

  const streamBuf = Buffer.from(streamContent, 'utf-8');
  const streamLength = streamBuf.length;

  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>';
  objects[4] = `<< /Length ${streamLength} >>\nstream\n${streamContent}endstream`;
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';
  objects[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>';

  let pdf = '%PDF-1.4\n';
  const xrefOffsets = [0];

  for (let i = 1; i <= 6; i++) {
    xrefOffsets[i] = Buffer.byteLength(pdf, 'utf-8');
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startxref = Buffer.byteLength(pdf, 'utf-8');
  pdf += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    pdf += String(xrefOffsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf-8');
}
