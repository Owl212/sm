"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  total: number;
  byProgram: { program: string; count: number }[];
  byYear: { year: number; count: number }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/students?limit=1000");
      const data = await res.json();

      if (data.students) {
        const students = data.students;
        const byProgram: Record<string, number> = {};
        const byYear: Record<number, number> = {};

        students.forEach((s: { program: string; year: number }) => {
          const prog = s.program || "Non défini";
          byProgram[prog] = (byProgram[prog] || 0) + 1;
          byYear[s.year] = (byYear[s.year] || 0) + 1;
        });

        setStats({
          total: data.total,
          byProgram: Object.entries(byProgram).map(([program, count]) => ({
            program,
            count,
          })),
          byYear: Object.entries(byYear).map(([year, count]) => ({
            year: parseInt(year),
            count,
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">
          Bienvenue, {session.user?.name} 👋
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Étudiants
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.total || 0}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Programmes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.byProgram.length || 0}
              </p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Actions rapides
              </p>
              <Link
                href="/students/new"
                className="inline-block mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                + Nouvel étudiant
              </Link>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>
      </div>

      {/* Stats Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Program */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Étudiants par programme
          </h2>
          {stats?.byProgram.length ? (
            <div className="space-y-3">
              {stats.byProgram.map((item) => (
                <div key={item.program} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.program}</span>
                      <span className="font-medium text-gray-900">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(item.count / (stats.total || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune donnée</p>
          )}
        </div>

        {/* By Year */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📅 Étudiants par année
          </h2>
          {stats?.byYear.length ? (
            <div className="space-y-3">
              {stats.byYear
                .sort((a, b) => a.year - b.year)
                .map((item) => (
                  <div key={item.year} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">
                          {item.year}
                          {item.year === 1
                            ? "ère"
                            : "ème"}{" "}
                          année
                        </span>
                        <span className="font-medium text-gray-900">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (item.count / (stats.total || 1)) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Quick link */}
      <div className="mt-8 text-center">
        <Link
          href="/students"
          className="inline-flex items-center px-6 py-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium"
        >
          Voir tous les étudiants →
        </Link>
      </div>
    </div>
  );
}
