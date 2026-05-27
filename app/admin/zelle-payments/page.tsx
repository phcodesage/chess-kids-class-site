"use client";

import { useEffect, useState } from "react";

interface ZellePayment {
  id: string;
  name: string;
  email?: string;
  phone: string;
  reference: string;
  courseName: string;
  amount: number;
  screenshotData?: string;
  screenshotName?: string;
  screenshotType?: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  notes?: string;
}

export default function ZellePaymentsPage() {
  const [payments, setPayments] = useState<ZellePayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ZellePayment[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<ZellePayment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<ZellePayment | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;
    
    if (filter !== "all") {
      filtered = filtered.filter((p) => p.status === filter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.reference.toLowerCase().includes(term) ||
          p.courseName.toLowerCase().includes(term) ||
          p.phone.includes(term)
      );
    }
    
    setFilteredPayments(filtered);
  }, [payments, filter, searchTerm]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch from MongoDB API
      const response = await fetch("/api/zelle-payments");
      
      if (!response.ok) {
        throw new Error("Failed to fetch payments from database");
      }
      
      const data = await response.json();
      const dbPayments = data.payments || [];
      
      // Also get localStorage payments as backup/merge
      const stored = JSON.parse(localStorage.getItem("zellePayments") || "[]");
      
      // Merge and deduplicate (prefer DB data)
      const dbIds = new Set(dbPayments.map((p: ZellePayment) => p.id));
      const localOnly = stored.filter((p: ZellePayment) => !dbIds.has(p.id));
      
      const allPayments = [...dbPayments, ...localOnly];
      
      // Sort by date, newest first
      allPayments.sort((a: ZellePayment, b: ZellePayment) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      
      setPayments(allPayments);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Failed to load payments from database. Showing local data only.");
      
      // Fallback to localStorage only
      const stored = JSON.parse(localStorage.getItem("zellePayments") || "[]");
      stored.sort((a: ZellePayment, b: ZellePayment) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setPayments(stored);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "verified" | "rejected") => {
    try {
      // Update in MongoDB
      const response = await fetch(`/api/zelle-payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update payment in database");
      }
      
      // Update local state
      const updated = payments.map((p) =>
        p.id === id ? { ...p, status: newStatus, notes } : p
      );
      
      // Also update localStorage
      localStorage.setItem("zellePayments", JSON.stringify(updated));
      setPayments(updated);
      setShowModal(false);
      setSelectedPayment(null);
      setNotes("");
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment. Please try again.");
    }
  };

  const deletePayment = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment record?")) {
      try {
        // Delete from MongoDB
        const response = await fetch(`/api/zelle-payments/${id}`, {
          method: "DELETE",
        });
        
        if (!response.ok && response.status !== 404) {
          throw new Error("Failed to delete payment from database");
        }
        
        // Update local state and remove from localStorage even if it was a ghost DB entry
        const updated = payments.filter((p) => p.id !== id);
        localStorage.setItem("zellePayments", JSON.stringify(updated));
        setPayments(updated);
      } catch (err) {
        console.error("Error deleting payment:", err);
        alert("Failed to delete payment. Please try again.");
      }
    }
  };

  const openActionModal = (payment: ZellePayment) => {
    setSelectedPayment(payment);
    setNotes(payment.notes || "");
    setShowModal(true);
  };

  const openReceiptModal = (payment: ZellePayment) => {
    setReceiptPayment(payment);
    setShowReceiptModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      verified: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brandNavy mb-1">Zelle Payments</h1>
          <p className="text-sm md:text-base text-gray-500">Manage and verify Zelle payment submissions</p>
          {error && (
            <p className="text-amber-600 text-sm mt-2">{error}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brandNavy text-white hover:bg-brandNavy/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="hidden sm:inline">MongoDB Connected</span>
            <span className="sm:hidden">DB Connected</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, reference, course, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/20 outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "verified", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-brandNavy text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin h-8 w-8 text-brandNavy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading payments...</h3>
            <p className="text-gray-500">Fetching data from database</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📭
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No payments found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== "all"
                ? "Try adjusting your filters"
                : "Zelle payment submissions will appear here"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[140px]">
                      Student
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[180px]">
                      Course
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[80px]">
                      Amount
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[140px]">
                      Reference
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[100px]">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[140px]">
                      Date
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[100px]">
                      Receipt
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[140px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-brandNavy truncate">{payment.name}</p>
                          <p className="text-xs text-brandNavy/60 truncate">{payment.email || "No Email"}</p>
                          <p className="text-sm text-gray-500">{payment.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700 line-clamp-2">{payment.courseName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-brandNavy whitespace-nowrap">
                          ${payment.amount?.toLocaleString() || "0"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                          {payment.reference}
                        </code>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(payment.status)}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-500 whitespace-nowrap">{formatDate(payment.submittedAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        {payment.screenshotData ? (
                          <button
                            onClick={() => openReceiptModal(payment)}
                            className="inline-flex items-center gap-1 text-sm text-brandNavy hover:text-brandNavy/80 font-medium whitespace-nowrap"
                          >
                            <span>📎</span>
                            View
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">No receipt</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openActionModal(payment)}
                            className="px-3 py-1.5 text-sm font-medium text-brandNavy bg-brandNavy/10 hover:bg-brandNavy/20 rounded-lg transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => deletePayment(payment.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brandNavy truncate">{payment.name}</p>
                      <p className="text-xs text-brandNavy/60 truncate">{payment.email || "No Email"}</p>
                      <p className="text-sm text-gray-500">{payment.phone}</p>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(payment.status)}</div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex gap-2">
                      <span className="text-gray-500 flex-shrink-0">Course:</span>
                      <p className="text-gray-700 break-words">{payment.courseName}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 flex-shrink-0">Amount:</span>
                      <p className="font-semibold text-brandNavy">
                        ${payment.amount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 flex-shrink-0">Reference:</span>
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded break-all">
                        {payment.reference}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 flex-shrink-0">Date:</span>
                      <p className="text-gray-700 text-xs">{formatDate(payment.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {payment.screenshotData ? (
                      <button
                        onClick={() => openReceiptModal(payment)}
                        className="inline-flex items-center gap-1 text-sm text-brandNavy hover:text-brandNavy/80 font-medium"
                      >
                        <span>📎</span>
                        View Receipt
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">No receipt</span>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openActionModal(payment)}
                        className="px-3 py-1.5 text-sm font-medium text-brandNavy bg-brandNavy/10 hover:bg-brandNavy/20 rounded-lg transition-colors"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => deletePayment(payment.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brandNavy px-6 py-4">
              <h2 className="text-lg font-bold text-white">Review Payment</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Student</p>
                    <p className="font-semibold text-brandNavy">{selectedPayment.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="font-semibold text-brandNavy">{selectedPayment.email || "No Email Given"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Phone</p>
                    <p className="font-semibold text-brandNavy">{selectedPayment.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Course</p>
                    <p className="font-semibold text-brandNavy">{selectedPayment.courseName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Amount</p>
                    <p className="font-semibold text-brandNavy">
                      ${selectedPayment.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase">Zelle Reference</p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedPayment.reference}
                    </code>
                  </div>
                </div>

                {selectedPayment.screenshotData && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Receipt</p>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        openReceiptModal(selectedPayment);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <span>📎</span>
                      View Receipt
                    </button>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this payment..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/20 outline-none resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(selectedPayment.id, "rejected")}
                  className="flex-1 py-3 rounded-xl bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus(selectedPayment.id, "verified")}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptPayment && receiptPayment.screenshotData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brandNavy px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white">Payment Receipt</h2>
                <p className="text-xs sm:text-sm text-white/70 truncate">
                  {receiptPayment.name} — {receiptPayment.courseName}
                </p>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-100">
              {receiptPayment.screenshotType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receiptPayment.screenshotData}
                  alt="Payment receipt"
                  className="max-w-full mx-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    📄
                  </div>
                  <p className="font-semibold text-brandNavy mb-2">
                    {receiptPayment.screenshotName}
                  </p>
                  <a
                    href={receiptPayment.screenshotData}
                    download={receiptPayment.screenshotName}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brandNavy text-white font-semibold rounded-xl hover:bg-brandNavy/90 transition-colors"
                  >
                    <span>⬇️</span>
                    Download File
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs sm:text-sm text-gray-500">
                <span className="font-medium">Reference:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">{receiptPayment.reference}</code>
              </div>
              <a
                href={receiptPayment.screenshotData}
                download={receiptPayment.screenshotName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brandNavy text-white font-medium rounded-lg hover:bg-brandNavy/90 transition-colors w-full sm:w-auto justify-center"
              >
                <span>⬇️</span>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
