"use client";

import { useState, useEffect } from "react";
import type { StudentFormData } from "@/lib/types";

interface StudentFormProps {
  initialData?: StudentFormData & { id?: number };
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function StudentForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
    program: "",
    year: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        date_of_birth: initialData.date_of_birth || "",
        program: initialData.program || "",
        year: initialData.year || 1,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Prénom de l'étudiant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nom de l'étudiant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de naissance
          </label>
          <input
            type="date"
            value={formData.date_of_birth || ""}
            onChange={(e) =>
              setFormData({ ...formData, date_of_birth: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programme
          </label>
          <select
            value={formData.program || ""}
            onChange={(e) =>
              setFormData({ ...formData, program: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Sélectionner --</option>
            <option value="Génie Informatique">Génie Informatique</option>
            <option value="Data Science">Data Science</option>
            <option value="Cybersécurité">Cybersécurité</option>
            <option value="Intelligence Artificielle">Intelligence Artificielle</option>
            <option value="Réseaux et Télécoms">Réseaux et Télécoms</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Année
          </label>
          <select
            value={formData.year || 1}
            onChange={(e) =>
              setFormData({ ...formData, year: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1ère année</option>
            <option value={2}>2ème année</option>
            <option value={3}>3ème année</option>
            <option value={4}>4ème année</option>
            <option value={5}>5ème année</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Mettre à jour"
            : "Créer l'étudiant"}
        </button>
      </div>
    </form>
  );
}
