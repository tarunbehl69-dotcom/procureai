import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import { Quotation, QuotationExtractedData } from '../types';
import { api } from '../services/api';
import { NavItemKey } from '../components/layout/Sidebar';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface QuotationAnalysisViewProps {
  onNavigate: (key: NavItemKey) => void;
}

export const QuotationAnalysisView: React.FC<QuotationAnalysisViewProps> = ({ onNavigate }) => {
  const {
    rfqs,
    selectedRfqId,
    setSelectedRfqId,
    selectedRfq,
    vendors,
    quotations,
    createQuotation,
    updateQuotation,
    showToast,
  } = useProcure();

  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedQuoteForReview, setSelectedQuoteForReview] = useState<Quotation | null>(null);
  const [editableData, setEditableData] = useState<QuotationExtractedData | null>(null);

  // Upload Form State
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.vendorId || 'vnd-alpha');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadedFileText, setUploadedFileText] = useState('');

  const currentQuotes = quotations.filter((q) => q.rfqId === selectedRfqId);

  const sampleFiles = [
    {
      fileName: 'Alpha_Paper_Quote_APS-2026.pdf',
      vendorId: 'vnd-alpha',
      vendorName: 'Alpha Paper Suppliers',
      text: `QUOTATION: APS/2026/QT-1108
Date: 30-Oct-2026 | Validity: 30 Days
To: Apex Paper Industries Pvt. Ltd., Vapi Works
Item: Industrial Packaging Paper (180 GSM Kraft Reel)
Quantity: 10,000 Units
Unit Price: ₹120.00 / Unit
Basic Amount: ₹12,00,000.00
Trade Discount: 2.0% (₹24,000.00)
Net Basic Amount: ₹11,76,000.00
GST: 18% (₹2,11,680.00) - Eligible for Input Tax Credit
Freight: ₹25,000.00 lump sum via road carrier
Estimated Delivery: 12 days from PO receipt
Payment Terms: 30 days credit from GRN
Destination: Apex Paper Vapi Plant`,
    },
    {
      fileName: 'Beta_Industrial_Quote_BIM-0942.pdf',
      vendorId: 'vnd-beta',
      vendorName: 'Beta Industrial Materials',
      text: `OFFICIAL PROPOSAL: BIM/QUOT/26/0942
Date: 31-Oct-2026 | Validity: 05-Dec-2026
Client: Apex Paper Industries Pvt. Ltd.
Material: Premium Industrial Packaging Kraft Reels 180 GSM (24 BF)
Order Quantity: 10,000 Units
Base Rate: ₹123.00 / Unit
Subtotal: ₹12,30,000.00
Bulk Rebate: 3.0% (₹36,900.00)
Net Amount: ₹11,93,100.00
GST: 18% (₹2,14,758.00)
Freight Charges: Subsidized rate ₹15,000.00 direct dispatch
Delivery Lead Time: 10 working days guaranteed
Payment Terms: 45 Days Credit via RTGS against tax invoice
Delivery Point: Apex Works Vapi`,
    },
    {
      fileName: 'Gamma_Packaging_Quote_GPS-8819.xlsx',
      vendorId: 'vnd-gamma',
      vendorName: 'Gamma Packaging Solutions',
      text: `COMMERCIAL QUOTATION: GPS-Q-26-8819
Date: 01-Nov-2026 | Valid Until: 25-Nov-2026
Customer: Apex Paper Industries
Product: Standard Packaging Kraft Paper 180 GSM
Quantity: 10,000 Units
Unit Price: ₹116.00 / Unit
Gross Value: ₹11,60,000.00
Special Discount: 1.0% (₹11,600.00)
Net Basic: ₹11,48,400.00
GST: 18% (₹2,06,712.00)
Freight Extra: ₹35,000.00 via third-party logistics
Estimated Delivery Time: 20 Days (due to manufacturing schedule)
Payment Terms: 15 Days Credit from dispatch date
Location: Ex-Factory Gandhinagar / Delivered Vapi`,
    },
  ];

  const handleSelectSample = (sample: typeof sampleFiles[0]) => {
    setSelectedFileName(sample.fileName);
    setSelectedVendorId(sample.vendorId);
    setUploadedFileText(sample.text);
    showToast(`Loaded sample file: ${sample.fileName}`, 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFileText((event.target?.result as string) || `File: ${file.name} (Binary Content)`);
      };
      reader.readAsText(file);
      showToast(`Selected file ${file.name}`, 'info');
    }
  };

  const handleRunAiExtraction = async () => {
    if (!selectedFileName && !uploadedFileText) {
      showToast('Please select or upload a quotation document', 'warning');
      return;
    }

    try {
      setIsExtracting(true);
      const matchedVendor = vendors.find(v => v.vendorId === selectedVendorId);

      const result = await api.extractQuotationWithGemini({
        documentText: uploadedFileText,
        fileName: selectedFileName || 'Supplier_Quotation.pdf',
        rfqTitle: selectedRfq?.title,
        expectedQuantity: selectedRfq?.quantity,
      });

      if (result && result.extractedData) {
        const extracted = result.extractedData;
        const newQuote = await createQuotation({
          rfqId: selectedRfqId,
          vendorId: selectedVendorId,
          fileName: selectedFileName || 'Extracted_Quotation.pdf',
          fileSize: '480 KB',
          fileType: 'application/pdf',
          quotationNumber: extracted.quotationNumber || `QT-${Date.now().toString().slice(-5)}`,
          quotationDate: extracted.quotationDate || new Date().toISOString().split('T')[0],
          validityDate: extracted.validityDate || '2026-12-15',
          extractedData: {
            ...extracted,
            vendorName: matchedVendor?.vendorName || extracted.vendorName,
          },
          extractionStatus: 'Extracted',
          verificationStatus: 'Unverified',
        });

        setSelectedQuoteForReview(newQuote);
        setEditableData({ ...newQuote.extractedData });
        showToast('Document extracted successfully! Please verify fields.', 'success');
      }
    } catch (err: any) {
      showToast(`Extraction error: ${err.message}`, 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveVerification = async () => {
    if (!selectedQuoteForReview || !editableData) return;

    const qty = editableData.quantity || 1;
    const rate = editableData.unitPrice || 0;
    const basic = qty * rate;
    const discount = editableData.discountAmount || (basic * (editableData.discountPercent || 0)) / 100;
    const netBasic = basic - discount;
    const gst = editableData.gstAmount || (netBasic * (editableData.gstPercent || 18)) / 100;
    const total = netBasic + gst + (editableData.freightCharges || 0) + (editableData.insuranceCharges || 0) + (editableData.otherCharges || 0);

    const updatedData: QuotationExtractedData = {
      ...editableData,
      basicAmount: basic,
      discountAmount: discount,
      netBasicAmount: netBasic,
      gstAmount: gst,
      totalQuotationValue: Math.round(total),
    };

    await updateQuotation(selectedQuoteForReview.quotationId, {
      extractedData: updatedData,
      verificationStatus: 'Verified',
      verifiedBy: 'Ananya Deshmukh (Procurement Manager)',
      verifiedAt: new Date().toISOString(),
    });

    setSelectedQuoteForReview(null);
    setEditableData(null);
    showToast('Quotation verified! It is now incorporated into the Evaluation Matrix.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            AI Quotation Upload & Extraction Centre
          </h1>
          <p className="text-xs text-slate-500">
            Automated document ingestion, line-item commercial parsing, confidence scoring & human verification
          </p>
        </div>

        <button
          onClick={() => onNavigate('vendor-comparison')}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
        >
          Go to Vendor Comparison
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Target RFQ Banner */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600">{selectedRfq?.rfqNumber}</span>
              <span className="text-xs font-bold text-slate-900">{selectedRfq?.title}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Required: {selectedRfq?.quantity.toLocaleString('en-IN')} {selectedRfq?.unit} · Required Lead Time: {selectedRfq?.deliveryLeadTimeDays} Days
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Select Target RFQ:</span>
          <select
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            {rfqs.map(r => (
              <option key={r.rfqId} value={r.rfqId}>
                {r.rfqNumber} ({r.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload & Quick Ingest Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Zone (2 Cols) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Upload Vendor Quotation Document
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Supports PDF, XLSX, CSV, JPG, PNG formats. Extracts unit rate, discounts, GST, freight, lead time, and payment terms.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Associate with Vendor *</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              >
                {vendors.map((v) => (
                  <option key={v.vendorId} value={v.vendorId}>
                    {v.vendorName} ({v.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Selected File Name</label>
              <input
                type="text"
                readOnly
                value={selectedFileName || 'No file selected yet'}
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-600 font-mono"
              />
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:border-blue-400 transition-colors">
            <UploadCloud className="h-8 w-8 text-blue-600" />
            <div className="mt-2 text-xs font-semibold text-slate-800">
              Drop quotation document here, or <label className="text-blue-600 cursor-pointer hover:underline font-bold"><input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.xlsx,.xls,.csv,.jpg,.png" />browse files</label>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              PDF, Excel (XLSX, CSV), or Image up to 25MB
            </div>
          </div>

          {/* Quick Trigger Button */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="text-[11px] text-slate-500">
              AI extraction runs securely on server via Gemini 3.8 Flash.
            </div>

            <button
              onClick={handleRunAiExtraction}
              disabled={isExtracting || (!selectedFileName && !uploadedFileText)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Extracting Quotation...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Extract with Gemini AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Synthetic Sample File Ingest (1 Col) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">1-Click Demonstration Files</h2>
            <p className="text-xs text-slate-500">Test the extraction engine with realistic quotes</p>
          </div>

          <div className="mt-3 space-y-2.5">
            {sampleFiles.map((s) => (
              <div
                key={s.fileName}
                onClick={() => handleSelectSample(s)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedFileName === s.fileName
                    ? 'border-blue-500 bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">{s.vendorName}</span>
                  <span className="text-[10px] font-mono text-slate-400">PDF/XLSX</span>
                </div>
                <div className="mt-1 text-[11px] font-mono text-slate-500 truncate">{s.fileName}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-amber-50/70 p-3 text-[11px] text-amber-900 border border-amber-200/70 leading-relaxed">
            <strong>Pro Tip:</strong> Click any vendor above, then hit <em>"Extract with Gemini AI"</em> to see structured document parsing in action!
          </div>
        </div>
      </div>

      {/* Extracted Quotations in this RFQ Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Quotations Uploaded for {selectedRfq?.rfqNumber} ({currentQuotes.length} Total)
            </h2>
            <p className="text-xs text-slate-500">
              Only verified quotations are included in the deterministic scoring engine
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Quote #</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-right">Freight</th>
                <th className="px-4 py-3 text-center">Delivery Days</th>
                <th className="px-4 py-3 text-center">Credit Days</th>
                <th className="px-4 py-3 text-center">AI Confidence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentQuotes.map((q) => {
                const data = q.extractedData;
                const isVerified = q.verificationStatus === 'Verified';
                return (
                  <tr key={q.quotationId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {data.vendorName || 'Supplier'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {q.quotationNumber}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₹{data.unitPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                      {data.discountPercent}% (₹{data.discountAmount?.toLocaleString('en-IN')})
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                      ₹{data.freightCharges?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                      {data.estimatedDeliveryDays} d
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                      {data.creditPeriodDays} d
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-700 border border-blue-200">
                        {data.extractionConfidence}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                        isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {q.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedQuoteForReview(q);
                          setEditableData({ ...q.extractedData });
                        }}
                        className="rounded border border-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Verify / Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured Editable Verification Drawer / Modal */}
      {selectedQuoteForReview && editableData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">
                  {selectedQuoteForReview.fileName}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Verify Extracted Quotation: {editableData.vendorName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedQuoteForReview(null);
                  setEditableData(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Warnings Banner if present */}
              {editableData.warnings && editableData.warnings.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>AI Extraction Warnings & Discrepancies</span>
                  </div>
                  <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-700 text-[11px]">
                    {editableData.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editableData.unitPrice}
                    onChange={(e) => setEditableData({ ...editableData, unitPrice: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Discount (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editableData.discountPercent}
                    onChange={(e) => setEditableData({ ...editableData, discountPercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Freight (₹)</label>
                  <input
                    type="number"
                    value={editableData.freightCharges}
                    onChange={(e) => setEditableData({ ...editableData, freightCharges: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">GST Rate (%)</label>
                  <input
                    type="number"
                    value={editableData.gstPercent}
                    onChange={(e) => setEditableData({ ...editableData, gstPercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Lead Time (Days) *</label>
                  <input
                    type="number"
                    value={editableData.estimatedDeliveryDays}
                    onChange={(e) => setEditableData({ ...editableData, estimatedDeliveryDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Credit Period (Days) *</label>
                  <input
                    type="number"
                    value={editableData.creditPeriodDays}
                    onChange={(e) => setEditableData({ ...editableData, creditPeriodDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 font-mono text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600">Payment Terms Description</label>
                  <input
                    type="text"
                    value={editableData.paymentTerms}
                    onChange={(e) => setEditableData({ ...editableData, paymentTerms: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-slate-900"
                  />
                </div>
              </div>

              {/* Source Clause Text Evidence */}
              {editableData.sourceReferences && Object.keys(editableData.sourceReferences).length > 0 && (
                <div>
                  <span className="font-semibold text-slate-800">Source Evidence in Document:</span>
                  <div className="mt-1 space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-3 text-[11px] font-mono text-slate-600">
                    {Object.entries(editableData.sourceReferences).map(([k, v]) => (
                      <div key={k}>
                        <strong className="text-slate-800">{k}:</strong> {v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setSelectedQuoteForReview(null);
                  setEditableData(null);
                }}
                className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveVerification}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Confirm & Verify Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
