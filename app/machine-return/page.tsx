"use client";

import { useEffect, useState } from "react";
import { InvoiceLists, machineReturnResponseDto } from "@/lib/types";
import { getInvoiceLists, getMachineReturnLists } from "@/lib/apis";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import MachineReturnTable from "@/components/machine-return/MachineReturnTable";

export default function MachineReturnPage() {
    const [loading, setLoading] = useState(true);   // true from the start: the page is loading on arrival  
  // --------------------------------------------------
  // Invoice Status
  // --------------------------------------------------

  const [status, setStatus] = useState("");

  // Change these values according to your database
  // status values.
  const MachineReturnStatuses = [
    {
      label: "All",
      value: "",
    },
    {
      label: "Pending",
      value: "PENDING",
    },
    {
      label: "Approved",
      value: "APPROVED",
    },
    {
      label: "Collected",
      value: "COLLECTED",
    },
  ];

  // --------------------------------------------------
  // Machine Return Data
  // --------------------------------------------------

  const [machineReturns, setMachineReturns] = useState<machineReturnResponseDto[]>([]);

  // --------------------------------------------------
  // Search filters
  // --------------------------------------------------

  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // --------------------------------------------------
  // Server-side pagination
  // --------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Number of records requested from the API
  const pageSize = 10;

  // --------------------------------------------------
  // Export option
  // --------------------------------------------------

  const [isExporting, setIsExporting] = useState(false);

  // --------------------------------------------------
  // Get Company ID
  // --------------------------------------------------

  const getCompanyId = (): string => {
    const companyId =
      localStorage.getItem("companyID") ||
      sessionStorage.getItem("companyID");

    if (!companyId) {
      throw new Error("Company ID not found.");
    }

    return companyId;
  };

  // --------------------------------------------------
  // Handle Page Change
  // --------------------------------------------------

  const handlePageChange = (
    page: number
  ) => {
    loadMachineReturn(
      page,
      query,
      fromDate,
      toDate,
      status
    );
  };

    useEffect(() => {
      loadMachineReturn(
        1,
        "",
        "",
        "",
        ""
      );
    }, []);

  // --------------------------------------------------
  // Loading Machine Returns
  // --------------------------------------------------

  const loadMachineReturn = async ( 
    page: number,
    searchQuery: string = query,
    searchFromDate: string = fromDate,
    searchToDate: string = toDate,
    searchStatus: string = status
  ) => {
    try {
      setLoading(true);
      debugger;
      const companyId = getCompanyId();

      const data = await getMachineReturnLists({
        query: searchQuery,
        fromDate: searchFromDate,
        toDate: searchToDate,

        page,
        pageSize,

        companyId,

        status: searchStatus,
      });      

      // Invoice records
      setMachineReturns(data.items);      
      // Pagination information
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setLoading(false);
    } catch (error) {
      console.error(
        "Something went wrong:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Get Company ID
  // --------------------------------------------------

  const handleStatusChange = async (status: string) => { 

  }

  const handleExport = async () => { 

  }

  const handleClear = async () => { 

  }

  const handleSearch = async () => {     
    loadMachineReturn(
      1,
      query,
      fromDate,
      toDate,
      status
    );
  }

    return (
        <div className="flex min-h-screen bg-surface font-display">      
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <Topbar title="Machine Return Lists" />

        <div className="m-5 space-y-6">
           <LoadingOverlay
              show={loading}
              delayMs={0}               // first load: show immediately, no empty flash
              title="Generating report"
              message="Calculating revenue figures..."
            />        

          {/* ================================================== */}
          {/* Machine Return Table */}
          {/* ================================================== */}

          <MachineReturnTable 
            data={machineReturns} 
            currentPage={currentPage} 
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
          />                    
        </div>

      </div>

    </div>
    );
}