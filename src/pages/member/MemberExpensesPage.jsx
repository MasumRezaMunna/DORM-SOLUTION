import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart, Home } from "lucide-react";
import PageHeader from "../../components/shared/PageHeader";
import DataTable from "../../components/shared/DataTable";
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency, formatDate, getMonthName } from "../../utils/helpers";
import api from "../../config/axios";
import { EXPENSE_TYPES } from "../../utils/constants";

export default function MemberExpensesPage() {
  const { isDark } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [filterType, setFilterType] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["member-expenses", month, year, filterType],
    queryFn: async () => {
      let url = "/expenses/member?month=" + month + "&year=" + year + "&limit=200";
      if (filterType !== "All") url += "&expenseType=" + filterType;
      const { data } = await api.get(url);
      return data.data || { expenses: [], groceryCost: 0, commonCost: 0, grandTotal: 0 };
    },
    placeholderData: { expenses: [], groceryCost: 0, commonCost: 0, grandTotal: 0 },
  });

  const expenses    = data?.expenses    || [];
  const groceryCost = data?.groceryCost ?? 0;
  const commonCost  = data?.commonCost  ?? 0;
  const grandTotal  = data?.grandTotal  ?? 0;

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cardBg    = isDark ? "bg-[#202720] border-[#394239]" : "bg-white border-[#DDE1D8] shadow-sm";
  const textMuted = isDark ? "text-[#B1B8AC]" : "text-[#687168]";

  const summaryCards = [
    { label: "Total Expense", value: formatCurrency(grandTotal),  Icon: ShoppingBag,  color: "text-[#526B52] dark:text-[#A3B18A]", ring: "bg-[#E8EDE3] dark:bg-[#303A30]" },
    { label: "Grocery Cost",  value: formatCurrency(groceryCost), Icon: ShoppingCart, color: "text-[#526B52] dark:text-[#A3B18A]", ring: "bg-[#E8EDE3] dark:bg-[#303A30]" },
    { label: "Common Cost",   value: formatCurrency(commonCost),  Icon: Home,         color: "text-[#687168] dark:text-[#B1B8AC]", ring: "bg-[#ECECE4] dark:bg-[#292F29]" },
  ];

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row) => {
        const cat = EXPENSE_TYPES.find(c => c.value === row.expenseType);
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">{cat?.icon || "🛒"}</span>
            <div>
              <p className={"font-semibold text-sm " + (isDark ? "text-[#F0F1E9]" : "text-[#202720]")}>{row.title}</p>
              <span className={"inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase " + (row.expenseType === "Grocery" ? "bg-[#E8EDE3] dark:bg-[#303A30] text-[#526B52] dark:text-[#A3B18A]" : "bg-[#ECECE4] dark:bg-[#292F29] text-[#687168] dark:text-[#B1B8AC]")}>
                {row.expenseType}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <span className="text-rose-500 dark:text-rose-400 font-bold text-sm tabular-nums">{formatCurrency(row.amount)}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => <span className={"text-sm font-medium " + textMuted}>{formatDate(row.date)}</span>,
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => <span className={"text-xs " + textMuted}>{row.notes || "—"}</span>,
    },
    {
      key: "addedBy",
      label: "Added By",
      render: (row) => <span className={"text-xs font-medium " + textMuted}>{row.createdBy?.displayName || "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Expenses"
        subtitle="View dormitory expenses for the selected month"
      />

      {/* Month Navigator */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className={"p-2 rounded-xl border transition-colors " + (isDark ? "border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]" : "border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]")}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={"text-sm font-bold min-w-[110px] text-center " + (isDark ? "text-[#F0F1E9]" : "text-[#202720]")}>
          {getMonthName(month)} {year}
        </span>
        <button onClick={nextMonth} className={"p-2 rounded-xl border transition-colors " + (isDark ? "border-[#394239] hover:bg-[#292F29] text-[#B1B8AC]" : "border-[#DDE1D8] hover:bg-[#ECECE4] text-[#687168]")}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, Icon, color, ring }) => (
          <div key={label} className={"flex items-center gap-4 px-5 py-4 rounded-2xl border " + cardBg}>
            <div className={"p-2.5 rounded-xl " + ring}>
              <Icon className={"w-5 h-5 " + color} />
            </div>
            <div>
              <p className={"text-xs font-semibold " + textMuted}>{label}</p>
              <p className={"text-xl font-extrabold tracking-tight tabular-nums " + (isDark ? "text-[#F0F1E9]" : "text-[#202720]")}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["All", "Grocery", "Common"].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={"px-4 py-2 rounded-xl text-sm font-bold transition-all " + (filterType === type ? "bg-[#526B52] dark:bg-[#A3B18A] text-white dark:text-[#171C18] shadow-sm" : isDark ? "bg-[#202720] text-[#B1B8AC] border border-[#394239] hover:bg-[#292F29]" : "bg-white text-[#687168] hover:bg-[#ECECE4] border border-[#DDE1D8]")}
          >
            {type}
          </button>
        ))}
        <span className={"ml-auto text-xs font-medium " + textMuted}>{expenses.length} entries</span>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        loading={isLoading}
        emptyMessage="No expenses recorded for this month."
      />
    </div>
  );
}
