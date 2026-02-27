"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Student } from "@/lib/types";

export default function StudentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchStudent();
    }
  }, [session, params.id]);

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      } else {
        router.push("/students");
      }
    } catch {
      router.push("/students");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return;

    try {
      const res = await fetch(`/api/students/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/students");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session || !student) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/students"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Retour à la liste
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-gray-500 mt-1">{student.email}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/students/${student.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors"
            >
              ✏️ Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prénom
              </label>
              <p className="text-gray-900 mt-1">{student.first_name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </label>
              <p className="text-gray-900 mt-1">{student.last_name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <p className="text-gray-900 mt-1">{student.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de naissance
              </label>
              <p className="text-gray-900 mt-1">
                {student.date_of_birth
                  ? new Date(student.date_of_birth).toLocaleDateString("fr-FR")
                  : "Non renseignée"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programme
              </label>
              <p className="text-gray-900 mt-1">
                <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                  {student.program || "Non défini"}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Année
              </label>
              <p className="text-gray-900 mt-1">
                {student.year}
                {student.year === 1 ? "ère" : "ème"} année
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
          <p>
            Créé le :{" "}
            {new Date(student.created_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            Mis à jour le :{" "}
            {new Date(student.updated_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
