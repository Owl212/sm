"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StudentForm from "@/components/StudentForm";
import type { Student, StudentFormData } from "@/lib/types";
import Link from "next/link";

export default function EditStudentPage() {
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

  const handleSubmit = async (data: StudentFormData) => {
    const res = await fetch(`/api/students/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la mise à jour");
    }

    router.push(`/students/${params.id}`);
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
          href={`/students/${params.id}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Retour au détail
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Modifier l&apos;étudiant
        </h1>
        <StudentForm
          initialData={{
            ...student,
            date_of_birth: student.date_of_birth ?? undefined,
            program: student.program ?? undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/students/${params.id}`)}
          isEditing
        />
      </div>
    </div>
  );
}
