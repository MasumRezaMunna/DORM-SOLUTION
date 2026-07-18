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

  const cardBg    = isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-sm";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const summaryCards = [
    { label: "Total Expense", value: formatCurrency(grandTotal),  Icon: ShoppingBag,  color: "text-purple-400", ring: "bg-purple-500/10" },
    { label: "Grocery Cost",  value: formatCurrency(groceryCost), Icon: ShoppingCart, color: "text-green-400",  ring: "bg-green-500/10"  },
    { label: "Common Cost",   value: formatCurrency(commonCost),  Icon: Home,         color: "text-blue-400",   ring: "bg-blue-500/10"   },
  ];

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row) => {
        const cat = EXPENSE_TYPES.find(c => c.value === row.expenseType);
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">{cat?.icon || "??"}</span>
            <div>
              <p className={"font-medium text-sm " + (isDark ? "text-white" : "text-slate-800")}>{row.title}</p>
              <span className={"inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase " + (row.expenseType === "Grocery" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500")}>
                {row.expenseType === "Grocery" ? "?? " : "?? "}{row.expenseType}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <span className="text-red-400 font-semibold text-sm">{formatCurrency(row.amount)}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => <span className={"text-sm " + textMuted}>{formatDate(row.date)}</span>,
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => <span className={"text-xs " + textMuted}>{row.notes || "—"}</span>,
    },
    {
      key: "addedBy",
      label: "Added By",
      render: (row) => <span className={"text-xs " + textMuted}>{row.createdBy?.displayName || "—"}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Monthly Expenses"
        subtitle="View dormitory expenses for the selected month"
      />

      {/* Month Navigator */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className={"p-2 rounded-xl border transition-colors " + (isDark ? "border-white/10 hover:bg-white/5 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500")}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={"text-sm font-semibold min-w-[110px] text-center " + (isDark ? "text-white" : "text-slate-800")}>
          {getMonthName(month)} {year}
        </span>
        <button onClick={nextMonth} className={"p-2 rounded-xl border transition-colors " + (isDark ? "border-white/10 hover:bg-white/5 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500")}>
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
              <p className={"text-xs " + textMuted}>{label}</p>
              <p className={"text-lg font-bold " + (isDark ? "text-white" : "text-slate-800")}>{value}</p>
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
            className={"px-4 py-2 rounded-xl text-sm font-semibold transition-colors " + (filterType === type ? "bg-purple-600 text-white" : isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200")}
          >
            {type}
          </button>
        ))}
        <span className={"ml-auto text-xs " + textMuted}>{expenses.length} entries</span>
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
