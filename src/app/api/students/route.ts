import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Student } from "@/lib/types";

// Ensure DB is seeded
import "@/lib/seed";

// GET all students
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let students: Student[];
    let total: { count: number };

    if (search) {
      const searchPattern = `%${search}%`;
      students = db
        .prepare(
          `SELECT * FROM students 
           WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR program LIKE ?
           ORDER BY id DESC LIMIT ? OFFSET ?`
        )
        .all(searchPattern, searchPattern, searchPattern, searchPattern, limit, offset) as Student[];

      total = db
        .prepare(
          `SELECT COUNT(*) as count FROM students 
           WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR program LIKE ?`
        )
        .get(searchPattern, searchPattern, searchPattern, searchPattern) as { count: number };
    } else {
      students = db
        .prepare("SELECT * FROM students ORDER BY id DESC LIMIT ? OFFSET ?")
        .all(limit, offset) as Student[];

      total = db
        .prepare("SELECT COUNT(*) as count FROM students")
        .get() as { count: number };
    }

    return NextResponse.json({
      students,
      total: total.count,
      page,
      totalPages: Math.ceil(total.count / limit),
    });
  } catch (error) {
    console.error("GET students error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - create new student
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { first_name, last_name, email, date_of_birth, program, year } =
      await request.json();

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: "Prénom, nom et email sont obligatoires" },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existing = db
      .prepare("SELECT id FROM students WHERE email = ?")
      .get(email);

    if (existing) {
      return NextResponse.json(
        { error: "Un étudiant avec cet email existe déjà" },
        { status: 409 }
      );
    }

    const result = db
      .prepare(
        `INSERT INTO students (first_name, last_name, email, date_of_birth, program, year)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(first_name, last_name, email, date_of_birth || null, program || null, year || 1);

    const student = db
      .prepare("SELECT * FROM students WHERE id = ?")
      .get(result.lastInsertRowid) as Student;

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST student error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'étudiant" },
      { status: 500 }
    );
  }
}
