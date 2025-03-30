"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useReactTable, getCoreRowModel, getSortedRowModel, SortingState } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ExclamationCircleIcon, ShieldExclamationIcon, UsersIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

const pageSize = 10;
const initialVisibleRows = 5;

export default function DataTable() {
  const [data, setData] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleRows, setVisibleRows] = useState(initialVisibleRows);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [dateRange, setDateRange] = useState<number>(0);


  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/data`, { params: { page: pageIndex + 1 } });
      setData(response.data.data);
      setVisibleRows(initialVisibleRows);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex]);

  const updateStatus = (id: string, newStatus: string) => {
    setData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, about: { ...item.about, status: newStatus } } : item))
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            setVisibleRows((prev) => prev + 5);
          }, 1500);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [visibleRows]);

  const { inactivePercentage, blockedPercentage } = useMemo(() => {
    if (data.length === 0) return { inactivePercentage: 0, blockedPercentage: 0 };

    const totalUsers = data.length;
    const inactiveUsers = data.filter((record) => record.about.status === "INACTIVE").length;
    const blockedUsers = data.filter((record) => record.about.status === "BLOCKED").length;

    return {
      inactivePercentage: ((inactiveUsers / totalUsers) * 100).toFixed(0),
      blockedPercentage: ((blockedUsers / totalUsers) * 100).toFixed(0),
    };
  }, [data]);

  const filteredData = useMemo(() => {
    const today = new Date();
    const fromDate = dateRange ? new Date(today.setDate(today.getDate() - dateRange)) : null;

    return data
      .filter((record) => {
        const nameMatch = record.about.name.toLowerCase().includes(globalFilter.toLowerCase());
        const statusMatch = statusFilter ? record.about.status === statusFilter : true;
        const date = new Date(record.details.date);
        const dateMatch = fromDate ? date >= fromDate : true;
        return nameMatch && statusMatch && dateMatch;
      })
      .slice(0, visibleRows);
  }, [data, globalFilter, statusFilter, dateRange, visibleRows]);


  const table = useReactTable({
    data: filteredData,
    columns: [
      { accessorKey: "about.name", header: "Name" },
      { accessorKey: "about.status", header: "Status" },
      { accessorKey: "about.email", header: "Email" },
      { accessorKey: "details.date", header: "Date" },
      { accessorKey: "details.invitedBy", header: "Invited By" },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const { id } = row.original;
          return (
            <div className="flex gap-2">
              {[
                { status: "ACTIVE", color: "green", icon: CheckCircleIcon },
                { status: "INACTIVE", color: "red", icon: XCircleIcon },
                { status: "BLOCKED", color: "gray", icon: ExclamationCircleIcon },
              ].map(({ status, color, icon: Icon }) => (
                <button
                  key={status}
                  onClick={() => updateStatus(id, status)}
                  className={`p-3 rounded-full border-2 transition-all shadow-md flex items-center justify-center 
        ${color === "green" ? "bg-green-500 border-green-500" : ""}
        ${color === "red" ? "bg-red-500 border-red-500" : ""}
        ${color === "gray" ? "bg-gray-500 border-gray-500" : ""}`}
                >
                  <Icon
                    className={`h-6 w-6 rounded-full text-white`}
                  />
                </button>
              ))}
            </div>

          );
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <>
      <div className="mb-4 flex gap-6">
        <div className="p-5 bg-white border border-gray-300 text-gray-800 rounded-2xl shadow-md w-1/3 flex items-center gap-4">
          <div className="h-14 w-14 flex items-center justify-center bg-green-100 rounded-md">
            <UsersIcon className="h-8 w-8 text-green-700" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Inactive Users</h3>
            <p className="text-3xl font-bold">{inactivePercentage}%</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-300 text-gray-800 rounded-2xl shadow-md w-1/3 flex items-center gap-4">
          <div className="h-14 w-14 flex items-center justify-center bg-green-100 rounded-md">
            <ShieldExclamationIcon className="h-8 w-8 text-green-700" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Blocked Users</h3>
            <p className="text-3xl font-bold">{blockedPercentage}%</p>
          </div>
        </div>
      </div>


      <div className="flex flex-wrap gap-4 mb-4 justify-between">
        <input
          type="text"
          placeholder="Search name..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-1/4 shadow-sm"
        />
        <div className="flex gap-4 min-w-[30vw]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded w-1/4 shadow-sm"
          >
            <option value="" disabled hidden>
              Status
            </option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded w-1/4 shadow-sm"
          >
            <option value={0}>All Dates</option>
            <option value={1}>Last 1 Day</option>
            <option value={2}>Last 2 Days</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button
            onClick={() => {
              setGlobalFilter("");
              setStatusFilter("");
              setToDate(null);
              setFromDate(null);
            }}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition"
          >
            <XMarkIcon className="h-5 w-5 text-white" />
            Clear Filters
          </button>
        </div>
      </div>

      <div className=" mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-gray-700 text-sm uppercase">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="p-4 text-left cursor-pointer hover:text-black transition"
                  >
                    {header.column.columnDef.header}{" "}
                    {header.column.getIsSorted() === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4 pl-1 inline text-gray-600" />
                    ) : header.column.getIsSorted() === "desc" ? (
                      <ArrowDownIcon className="h-4 w-4 pl-1 inline text-gray-600" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4 pl-1 inline text-gray-600 opacity-50" />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.slice(0, visibleRows).map((row, rowIndex) => (
              <tr key={row.id} className={`border-t ${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 text-gray-700">
                    {cell.column.columnDef.cell ? cell.column.columnDef.cell(cell) : cell.getValue()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>

        {visibleRows < pageSize && <div ref={observerRef} className="h-10 flex items-center justify-center text-gray-500">Loading...</div>}

      </div>


      <div className="mt-6 flex justify-between items-center mb-12 mx-[25vw]">
        <button
          onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          disabled={pageIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-all 
          ${pageIndex === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Previous
        </button>

        <button
          onClick={() => setPageIndex((prev) => prev + 1)}
          disabled={pageIndex === 9}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-all 
          ${pageIndex === 9
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
        >
          Next
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}

