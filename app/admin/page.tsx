"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  zelle: {
    total: number;
    pending: number;
    verified: number;
    amount: number;
  };
}

interface ZellePaymentRecord {
  id: string;
  status: string;
  amount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    zelle: { total: 0, pending: 0, verified: 0, amount: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load Zelle Payments
        let zellePayments = [];
        try {
          const zRes = await fetch("/api/zelle-payments");
          if (zRes.ok) {
            const zData = await zRes.json();
            zellePayments = zData.payments || [];
          }
        } catch (e) {
          console.error("Zelle api fail, fallback to local storage", e);
        }
        
        const storedZelle = JSON.parse(localStorage.getItem("zellePayments") || "[]");
        const dbIds = new Set(zellePayments.map((p: ZellePaymentRecord) => p.id));
        const localOnly = storedZelle.filter((p: ZellePaymentRecord) => !dbIds.has(p.id));
        const allZelle = [...zellePayments, ...localOnly];

        setStats({
          zelle: {
            total: allZelle.length,
            pending: allZelle.filter((p: ZellePaymentRecord) => p.status === "pending").length,
            verified: allZelle.filter((p: ZellePaymentRecord) => p.status === "verified").length,
            amount: allZelle.reduce((sum: number, p: ZellePaymentRecord) => sum + (p.amount || 0), 0),
          },
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brandNavy mb-2">Dashboard Overview</h1>
      <p className="text-gray-500 mb-8">Quick glance at your learning center&apos;s recent activities</p>

      {/* Zelle Payments Stats */}
      <h2 className="text-xl font-bold text-brandNavy mb-4">Zelle Payments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Payments</p>
              <p className="text-3xl font-bold text-brandNavy mt-1">{loading ? "..." : stats.zelle.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{loading ? "..." : stats.zelle.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Verified</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{loading ? "..." : stats.zelle.verified}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              ✓
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Amount</p>
              <p className="text-3xl font-bold text-brandNavy mt-1">
                ${loading ? "..." : stats.zelle.amount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-brandNavy mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/zelle-payments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brandNavy text-white font-semibold rounded-xl hover:bg-brandNavy/90 transition-colors"
          >
            <span>💵</span>
            View Zelle Payments
          </Link>
        </div>
      </div>
    </div>
  );
}
