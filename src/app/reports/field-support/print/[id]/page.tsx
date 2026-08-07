"use client";

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";

export default function PrintFieldSupportReport() {
  const params = useParams();
  const { data: report, isLoading } = api.fieldSupport.getById.useQuery({
    id: params.id as string,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading print view...</div>;
  }

  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found</div>;
  }

  // Create an array of 20 items. Fill with actual data, then pad with empty items.
  const rows = Array.from({ length: 20 }, (_, i) => {
    return report.items[i] || {
      id: i + 1,
      srName: "",
      orderNo: "",
      customerName: "",
      product: "",
      unit: "",
      advanceAmount: "",
      adc: "",
    };
  });

  return (
    <div className="bg-white min-h-screen p-8 print:p-0 text-black font-sans">
      <div className="max-w-[210mm] mx-auto border-2 border-black">
        {/* Title */}
        <div className="bg-gray-300 border-b-2 border-black text-center font-bold text-lg py-1">
          Tm & Above Field Support
        </div>

        {/* Metadata */}
        <div className="flex border-b-2 border-black text-sm font-bold h-12">
          <div className="flex-1 flex flex-col justify-center px-2">
            <div>NAME:- {report.manager.firstName} {report.manager.lastName}</div>
            <div>BRANCH:- {report.branch.name}</div>
          </div>
          <div className="flex-1 flex flex-col justify-center px-2 border-l border-black">
            <div>E CODE:- {report.manager.employeeCode || ""}</div>
            <div>MONTH:- {report.month}</div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-xs text-center border-b-2 border-black">
          <thead>
            <tr className="bg-gray-300 font-bold border-b-2 border-black h-12">
              <th className="border-r border-black w-8 px-1">SL</th>
              <th className="border-r border-black px-1 w-24">SR/GL NAME</th>
              <th className="border-r border-black px-1 w-16">ORDER<br/>NO.</th>
              <th className="border-r border-black px-1">CUSTOMER NAME</th>
              <th className="border-r border-black px-1 w-24">PRODUCT</th>
              <th className="border-r border-black px-1 w-12">UNIT</th>
              <th className="border-r border-black px-1 w-20">ADVANCE<br/>AMOUNT</th>
              <th className="px-1 w-12">A/D/C</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-black h-6">
                <td className="border-r border-black font-bold">{idx + 1}</td>
                <td className="border-r border-black truncate px-1">{row.srName}</td>
                <td className="border-r border-black truncate px-1">{row.orderNo}</td>
                <td className="border-r border-black truncate px-1">{row.customerName}</td>
                <td className="border-r border-black truncate px-1">{row.product}</td>
                <td className="border-r border-black truncate px-1">{row.unit}</td>
                <td className="border-r border-black truncate px-1">{row.advanceAmount}</td>
                <td className="truncate px-1">{row.adc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Row */}
        <div className="flex border-b-2 border-black bg-gray-300 text-xs font-bold h-6 items-center text-center">
          <div className="flex-1">TOTAL</div>
          <div className="w-[110px] border-l border-black h-full"></div>
          <div className="w-[85px] border-l border-black h-full"></div>
          <div className="w-[50px] border-l border-black h-full"></div>
        </div>

        {/* Summary Block */}
        <div className="flex border-b-2 border-black">
          <div className="w-1/3 border-r-2 border-black">
            <div className="flex border-b border-black h-6 items-center text-xs font-bold">
              <div className="w-20 border-r border-black px-1 h-full flex items-center">POINT</div>
              <div className="flex-1 px-1">{report.totalPoint}</div>
            </div>
            <div className="flex border-b border-black h-6 items-center text-xs font-bold">
              <div className="w-20 border-r border-black px-1 h-full flex items-center">CUST</div>
              <div className="flex-1 px-1">{report.totalCust}</div>
            </div>
            <div className="flex h-6 items-center text-xs font-bold">
              <div className="w-20 border-r border-black px-1 h-full flex items-center">AMOUNT</div>
              <div className="flex-1 px-1">{report.totalAmount}</div>
            </div>
          </div>
          <div className="flex-1">
            {/* Empty space for the rest of the block */}
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between px-2 pt-1 pb-2 text-xs font-bold h-12 items-end">
          <div>APPROVAL</div>
          <div>DBM/BM</div>
          <div>TM/ABM</div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .max-w-[210mm] { border: 2px solid black !important; }
        }
      `}} />
    </div>
  );
}
