const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

// Static resolution lets Vercel trace and bundle these font files with the function.
const regularFont = require.resolve("@fontsource/inter/files/inter-latin-ext-400-normal.woff");
const boldFont = require.resolve("@fontsource/inter/files/inter-latin-ext-700-normal.woff");

function formatDate(date) {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Baku",
  }).format(new Date(date));
}

async function createCertificatePdf(certificate, frontendUrl) {
  const baseUrl = String(frontendUrl || "https://karyerayol.vercel.app")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");
  const verificationUrl = `${baseUrl}/certificates/${certificate.code}/verify`;
  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    type: "png",
    width: 260,
    margin: 1,
    color: { dark: "#2C1A0E", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });

  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", layout: "landscape", margin: 36, info: { Title: `Synex Academy - ${certificate.course.title}`, Author: "Synex Academy" } });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.registerFont("Inter", regularFont);
    document.registerFont("InterBold", boldFont);

    const pageWidth = document.page.width;
    const pageHeight = document.page.height;
    document.rect(0, 0, pageWidth, pageHeight).fill("#FFFAF6");
    document.lineWidth(4).strokeColor("#F37021").roundedRect(24, 24, pageWidth - 48, pageHeight - 48, 18).stroke();
    document.lineWidth(1).strokeColor("#F0CFBE").roundedRect(34, 34, pageWidth - 68, pageHeight - 68, 14).stroke();

    document.font("InterBold").fillColor("#F37021").fontSize(18).text("SYNEX ACADEMY", 64, 64, { characterSpacing: 2 });
    document.font("Inter").fillColor("#765F50").fontSize(11).text("Sinerji və Mükəmməllik", 64, 91);

    document.font("InterBold").fillColor("#2C1A0E").fontSize(34).text("SERTİFİKAT", 64, 137, { width: 560, align: "center" });
    document.font("Inter").fillColor("#765F50").fontSize(14).text("Bu sertifikat təqdim olunur", 64, 191, { width: 560, align: "center" });
    document.font("InterBold").fillColor("#D9531E").fontSize(28).text(certificate.user.name, 64, 224, { width: 560, align: "center" });
    document.font("Inter").fillColor("#513829").fontSize(14).text("aşağıdakı kursun yekun imtahanını uğurla tamamladığı üçün", 64, 271, { width: 560, align: "center" });
    document.font("InterBold").fillColor("#2C1A0E").fontSize(22).text(certificate.course.title, 64, 310, { width: 560, align: "center" });

    document.font("Inter").fillColor("#765F50").fontSize(11).text(`Verilmə tarixi: ${formatDate(certificate.issuedAt)}`, 74, 410);
    document.text(`Final balı: ${Math.round(certificate.finalScore ?? 0)}%`, 74, 435);
    document.text(`Sertifikat kodu: ${certificate.code}`, 74, 460, { width: 500 });

    document.image(qrBuffer, pageWidth - 210, 135, { width: 128, height: 128 });
    document.font("InterBold").fillColor("#2C1A0E").fontSize(12).text("Sertifikatı yoxla", pageWidth - 230, 280, { width: 168, align: "center" });
    document.font("Inter").fillColor("#765F50").fontSize(8).text(verificationUrl, pageWidth - 245, 308, { width: 198, align: "center", link: verificationUrl });
    document.font("InterBold").fillColor("#F37021").fontSize(11).text("Etibarlı rəqəmsal sertifikat", pageWidth - 245, 390, { width: 198, align: "center" });

    document.end();
  });
}

module.exports = { createCertificatePdf, formatDate };
