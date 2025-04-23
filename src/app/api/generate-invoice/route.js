import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../../components/InvoicePDF'; // Adjust this path as needed
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      item,
      cabData,
      companyInfo,
      companyLogo,
      signature,
      subCompanyName,
      invoiceNumber,
      derivePrefix,
    } = body;

    const invoiceId =
      invoiceNumber ||
      `${derivePrefix}-${String(item.invoiceSerial || 0).padStart(5, '0')}`;

    const invoiceDocument = (
      <InvoicePDF
        cabData={cabData}
        trip={item}
        companyLogo={companyLogo}
        signature={signature}
        companyPrefix={derivePrefix}
        companyInfo={companyInfo}
        companyName={subCompanyName}
        invoiceNumber={invoiceId}
        invoiceDate={new Date().toLocaleDateString('en-IN')}
      />
    );

    const buffer = await pdf(invoiceDocument).toBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Invoice-${item?.cab?.cabNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error('Server PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}