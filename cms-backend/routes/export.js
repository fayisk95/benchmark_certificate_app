const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const puppeteer = require('puppeteer');
const Docxtemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');

const router = express.Router();
const DOCX_TEMPLATE_PATH = path.resolve(__dirname, 'templates', 'certificate.docx');
const HTML_TEMPLATE_PATH = path.resolve(__dirname, 'templates', 'certificate.html');

// DOCX Image Options
const imageOpts = {
    centered: false,
    getImage(tagValue) {
        if (!tagValue) return Buffer.alloc(0);
        if (tagValue.startsWith('data:image')) {
            return Buffer.from(tagValue.split(',')[1], 'base64');
        }
        if (Buffer.isBuffer(tagValue)) return tagValue;
        return Buffer.from(tagValue, 'base64');
    },
    getSize(img, tagValue, tagName) {
        return [100, 100];
    }
};

// Prepare certificate data
const getCertificateData = body => {
    let photoBase64 = '';
    if (body.imagePath && fs.existsSync(body.imagePath)) {
        photoBase64 = fs.readFileSync(body.imagePath).toString('base64');
    } else if (body.photoBase64) {
        photoBase64 = body.photoBase64;
    }
    console.log('Photo base64 length:', photoBase64.length);
    console.log('Photo base64 length:', photoBase64.length);
    return {
        NAME: body.name || '',
        NATIONALITY: body.nationality || '',
        EID_LICENSE: body.license || '',
        EMPLOYER: body.employer || '',
        TRAINING_TITLE: body.course || '',
        TRAINING_DATE: body.trainingDate || '',
        CERTIFICATE_NO: body.certificateNo || '',
        BATCH_NO: body.batchNo || '',
        ISSUE_DATE: body.issueDate || '',
        DUE_DATE: body.dueDate || '',
        PHOTO_BASE64: photoBase64
    };
};

// Generate DOCX
async function generateDocx(data) {
    if (!fs.existsSync(DOCX_TEMPLATE_PATH)) throw new Error('DOCX template not found');

    const content = fs.readFileSync(DOCX_TEMPLATE_PATH, 'binary');
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [new ImageModule(imageOpts)]
    });

    try {
        doc.render(data);
    } catch (err) {
        // More descriptive error
        const errorMessages = err.properties?.errors?.map(e => e.explanation).join('; ') || err.message;
        throw new Error(`DOCX rendering failed: ${errorMessages}`);
    }

    return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// Generate PDF
async function generatePdf(data) {
    if (!fs.existsSync(HTML_TEMPLATE_PATH)) throw new Error("HTML template missing.");

    let htmlContent = fs.readFileSync(HTML_TEMPLATE_PATH, 'utf8');

    Object.keys(data).forEach(key => {
        let value = data[key];
        if (key === 'PHOTO_BASE64' && value) value = `data:image/jpeg;base64,${value}`;
        htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    htmlContent = htmlContent.replace(/src="(\.\.\/assets\/[^"]+)"/g, (match, p1) => {
        return `src="file://${path.join(__dirname, 'assets', path.basename(p1))}"`;
    });

    const tempHtmlPath = path.join(__dirname, `temp_${Date.now()}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0', timeout: 60000 });
        return await page.pdf({ format: 'A4', landscape: true, printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    } finally {
        await browser.close();
        fs.unlinkSync(tempHtmlPath);
    }
}

// API route
router.post('/generate-certificate', async (req, res) => {
    const { format, imagePath, ...dataBody } = req.body;
    const absoluteImagePath = imagePath ? path.resolve(__dirname, '../', imagePath) : null;

    const certificateData = getCertificateData({ ...dataBody, imagePath: absoluteImagePath });
    const formattedData = Object.fromEntries(Object.entries(certificateData).map(([k, v]) => [k.toUpperCase(), v]));

    try {
        let fileBuffer, fileExtension, mimeType;

        if (format === 'docx') {
            fileBuffer = await generateDocx(formattedData);
            fileExtension = 'docx';
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (format === 'pdf') {
            fileBuffer = await generatePdf(formattedData);
            fileExtension = 'pdf';
            mimeType = 'application/pdf';
        } else {
            return res.status(400).json({
                status: 'failed',
                message: "Invalid format. Use 'pdf' or 'docx'."
            });
        }

        const fileName = `certificate_${formattedData.NAME.replace(/\s/g, '_')}_${Date.now()}.${fileExtension}`;

        // 👉 Return file as proper binary
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        res.end(fileBuffer);  // safer than res.send
    } catch (error) {
        console.error('Certificate generation error:', error);
        res.status(500).json({ status: 'failed', message: `Server error: ${error.message}` });
    }
});


module.exports = router;
