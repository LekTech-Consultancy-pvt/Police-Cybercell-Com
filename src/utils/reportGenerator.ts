import jsPDF from 'jspdf';

interface Request {
    id: string;
    phoneNumber: string;
    timestamp: string;
    status: 'pending' | 'forwarded' | 'completed';
    stationCode: string;
    result?: {
        subscriberName: string;
        address: string;
        provider: string;
        crimeHistory?: string;
        encrypted: boolean;
    };
}

export const generateRequestReport = (request: Request) => {
    const doc = new jsPDF();
    const lineHeight = 10;
    let yPos = 20;

    // Header
    // doc.addImage("/logo.png", "PNG", 10, 10, 30, 30); // Placeholder for logo if available
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102); // Dark Blue
    doc.text("Police Cyber Cell - Investigation Report", 105, yPos, { align: "center" });
    yPos += 15;

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    // Request Details Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Request Details", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Request ID: ${request.id}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Submission Date: ${new Date(request.timestamp).toLocaleString()}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Station Code: ${request.stationCode}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Target Phone Number: ${request.phoneNumber}`, 20, yPos);
    yPos += 15;

    // Investigation Results Section
    if (request.result) {
        doc.setFillColor(240, 248, 255); // Light Blue background
        doc.rect(15, yPos - 5, 180, 55, 'F');

        doc.setFontSize(16);
        doc.setTextColor(0, 100, 0);
        doc.text("Investigation Results", 20, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Subscriber Name:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(request.result.subscriberName, 70, yPos);
        yPos += lineHeight;

        doc.setFont("helvetica", "bold");
        doc.text("Service Provider:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(request.result.provider, 70, yPos);
        yPos += lineHeight;

        doc.setFont("helvetica", "bold");
        doc.text("Registered Address:", 20, yPos);
        doc.setFont("helvetica", "normal");

        // Handle multi-line address
        const addressLines = doc.splitTextToSize(request.result.address, 110);
        doc.text(addressLines, 70, yPos);

        yPos += (lineHeight * addressLines.length) + 5;

        if (request.result.crimeHistory) {
            doc.setFont("helvetica", "bold");
            doc.text("Crime History:", 20, yPos);
            doc.setFont("helvetica", "normal");

            const historyLines = doc.splitTextToSize(request.result.crimeHistory, 110);
            doc.text(historyLines, 70, yPos);
            yPos += (lineHeight * historyLines.length) + 5;
        }
    } else {
        doc.setTextColor(200, 0, 0);
        doc.text("Investigation Status: In Progress / Pending Results", 20, yPos);
        yPos += 20;
    }

    // Footer
    yPos = 270;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.line(20, yPos - 5, 190, yPos - 5);
    doc.text("This document contains confidential information. Unauthorized distribution is prohibited.", 105, yPos, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 5, { align: "center" });

    doc.save(`Investigation_Report_${request.phoneNumber}.pdf`);
};
