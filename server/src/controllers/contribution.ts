import { Request, Response } from "express";
import Contribution from "../models/Contribution";
import Screenshot from '../models/Screenshot';
import User from "../models/User";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Register the plugin
(jsPDF as typeof jsPDF & { API: { autoTable: typeof autoTable } }).API.autoTable = autoTable;

// Helper to get numeric month from month string
const getMonthIndex = (monthStr: string) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return months.indexOf(monthStr);
};

interface ContributionPayload {
    userId: string;
    screenshotId?: string;
    amount: number;
    contributionDate: Date;
}

export const createContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can create contributions' });
            return;
        }
        // Validate required fields
        const { userId, amount, contributionDate, screenshotId } = <ContributionPayload>req.body;
        if (!userId || !amount || !contributionDate) {
            res.status(400).json({ error: 'Missing required fields: userId, amount, contributionDate' });
            return;
        }
        // Prevent creating contribution for a future date (allow any time today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const contribDate = new Date(contributionDate);
        contribDate.setHours(0, 0, 0, 0);
        if (contribDate > today) {
            res.status(400).json({ error: 'Cannot create contribution for a future date' });
            return;
        }
        // Upsert contribution (atomic)
        const contributionData = {
            userId,
            contributionDate,
            amount,
            screenshotId,
            verifiedBy: req.user.name,
        };
        const updatedContribution = await Contribution.findOneAndUpdate(
            { userId, contributionDate },
            { $set: contributionData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        // If screenshotId is present, mark screenshot as verified
        if (screenshotId) {
            await Screenshot.findByIdAndUpdate(screenshotId, { verified: true });
        }
        res.status(200).json(updatedContribution);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(400).json({ error: errorMessage });
        return;
    }
};

export const getAllContributions = async (req: Request, res: Response) => {
    try {
        const contributions = await Contribution.find().sort({ contributionDate: -1 });
        res.status(200).json(contributions);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const getContributionsByUser = async (req: Request, res: Response) => {
    const userId = req.params.userid;
    try {
        const contributions = await Contribution.find({ userId }).sort({ contributionDate: -1 });
        res.status(200).json(contributions);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const getContributionsByYearAndMonth = async (req: Request, res: Response) => {
    const { year, month } = req.params;
    try {
        // Find all contributions where contributionDate is in the given year and month
        const start = new Date(Number(year), getMonthIndex(month), 1);
        const end = new Date(Number(year), getMonthIndex(month) + 1, 1);
        const contributions = await Contribution.find({
            contributionDate: { $gte: start, $lt: end }
        }).sort({ contributionDate: -1 });
        res.status(200).json(contributions);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const getContributionById = async (req: Request, res: Response) => {
    try {
        const contribution = await Contribution.findById(req.params.id);
        if (!contribution) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json(contribution);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const getTotalContributionAmount = async (req: Request, res: Response) => {
    try {
        const total = await Contribution.aggregate([
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]);
        res.status(200).json({ total: total[0]?.totalAmount || 0 });
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const updateContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can update contributions' });
            return;
        };
        const updated = await Contribution.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json(updated);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(400).json({ error: errorMessage });
        return;
    }
};

export const deleteContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can delete contributions' });
            return;
        };
        const deleted = await Contribution.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json({ message: 'Deleted successfully' });
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const generateContributionsPDF = async (req: Request, res: Response) => {
    const { year, month } = req.params;
    
    try {
        // Get all verified users
        const users = await User.find({ verified: true }).sort({ name: 1 });
        
        // Get contributions for the specific month and year
        const start = new Date(Number(year), getMonthIndex(month), 1);
        const end = new Date(Number(year), getMonthIndex(month) + 1, 1);
        const contributions = await Contribution.find({
            contributionDate: { $gte: start, $lt: end }
        });
        
        // Get screenshots for the specific month
        const screenshots = await Screenshot.find({
            uploadMonth: month,
            uploadYear: year,
            type: 'payment'
        });
        
        // Create maps for quick lookup
        const contributionsMap: Record<string, any> = {};
        contributions.forEach((contrib) => {
            contributionsMap[contrib.userId.toString()] = contrib;
        });
        
        const screenshotsMap: Record<string, any> = {};
        screenshots.forEach((shot) => {
            screenshotsMap[shot.userId.toString()] = shot;
        });
        
        // Helper function to get status and amount for a user
        const getStatusAndAmount = (userId: string) => {
            const contrib = contributionsMap[userId];
            if (contrib) {
                return {
                    status: 'Paid',
                    amount: contrib.amount,
                    verifiedBy: contrib.verifiedBy || '-',
                };
            }
            const userScreenshot = screenshotsMap[userId];
            if (userScreenshot && Number(year) === new Date().getFullYear()) {
                return {
                    status: 'Pending',
                    amount: '-',
                    verifiedBy: '-',
                };
            }
            return {
                status: 'Due',
                amount: '-',
                verifiedBy: '-',
            };
        };
        
        // Prepare data for PDF export
        const exportRows = users.map(user => {
            const { status, amount, verifiedBy } = getStatusAndAmount((user._id as any).toString());
            return {
                Name: user.name,
                Status: status,
                Amount: amount,
                'Verified By': verifiedBy,
                Mobile: user.mobile || '-',
                "Father's Name": user.fatherName || '-',
            };
        });
        
        if (!exportRows.length) {
            res.status(404).json({ error: 'No data found for the specified month and year.' });
            return;
        }
        
        // Create PDF
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'A4',
        });
        
        const tableColumn = Object.keys(exportRows[0]);
        const tableRows = exportRows.map(row =>
            tableColumn.map(col =>
                String((row as Record<string, unknown>)[col] ?? '')
            )
        );
        
        // Generate today's date
        const getTodayDate = () => {
            const today = new Date();
            return today.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };
        
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'striped',
            styles: { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            margin: { left: 20, right: 20 },
            didDrawPage: function () {
                doc.setFontSize(16);
                doc.setTextColor(40, 128, 185);
                doc.text(
                    `Aakasmik Nidhi Status - ${month} ${year} => Generated on: ${getTodayDate()}`,
                    doc.internal.pageSize.getWidth() / 2,
                    30,
                    { align: 'center' }
                );
            },
        });
        
        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        
        // Set response headers for file download
        const fileName = `Aakasmik-Nidhi-${year}-${month}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send the PDF
        res.send(pdfBuffer);
        return;
        
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('PDF generation error:', err);
        res.status(500).json({ error: errorMessage });
        return;
    }
};
