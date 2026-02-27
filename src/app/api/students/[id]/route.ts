import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Student } from "@/lib/types";

// GET single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const student = db
      .prepare("SELECT * FROM students WHERE id = ?")
      .get(id) as Student | undefined;

    if (!student) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("GET student error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { first_name, last_name, email, date_of_birth, program, year } =
      await request.json();

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: "Prénom, nom et email sont obligatoires" },
        { status: 400 }
      );
    }

    // Check student exists
    const existing = db
      .prepare("SELECT id FROM students WHERE id = ?")
      .get(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    // Check duplicate email (exclude current student)
    const duplicate = db
      .prepare("SELECT id FROM students WHERE email = ? AND id != ?")
      .get(email, id);

    if (duplicate) {
      return NextResponse.json(
        { error: "Un autre étudiant utilise déjà cet email" },
        { status: 409 }
      );
    }

    db.prepare(
      `UPDATE students 
       SET first_name = ?, last_name = ?, email = ?, date_of_birth = ?, program = ?, year = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(first_name, last_name, email, date_of_birth || null, program || null, year || 1, id);

    const student = db
      .prepare("SELECT * FROM students WHERE id = ?")
      .get(id) as Student;

    return NextResponse.json(student);
  } catch (error) {
    console.error("PUT student error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = db
      .prepare("SELECT id FROM students WHERE id = ?")
      .get(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    db.prepare("DELETE FROM students WHERE id = ?").run(id);

    return NextResponse.json({ message: "Étudiant supprimé avec succès" });
  } catch (error) {
    console.error("DELETE student error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
