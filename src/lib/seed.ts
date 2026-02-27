import bcrypt from "bcryptjs";
import db from "@/lib/db";

// Seed an admin user if no users exist
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(
    "Admin",
    "admin@esisa.ac.ma",
    hashedPassword
  );
  console.log("✅ Admin user created: admin@esisa.ac.ma / admin123");
}

// Seed some students if none exist
const studentCount = db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number };

if (studentCount.count === 0) {
  const students = [
    { first_name: "Ahmed", last_name: "Khoungi", email: "ahmed.khoungi@esisa.ac.ma", date_of_birth: "2000-05-15", program: "Génie Informatique", year: 3 },
    { first_name: "Fatima", last_name: "Zahra", email: "fatima.zahra@esisa.ac.ma", date_of_birth: "2001-03-22", program: "Génie Informatique", year: 2 },
    { first_name: "Youssef", last_name: "Bennani", email: "youssef.bennani@esisa.ac.ma", date_of_birth: "1999-11-08", program: "Data Science", year: 4 },
    { first_name: "Sara", last_name: "Alami", email: "sara.alami@esisa.ac.ma", date_of_birth: "2002-07-30", program: "Cybersécurité", year: 1 },
    { first_name: "Omar", last_name: "Tazi", email: "omar.tazi@esisa.ac.ma", date_of_birth: "2000-01-12", program: "Génie Informatique", year: 3 },
  ];

  const insert = db.prepare(
    "INSERT INTO students (first_name, last_name, email, date_of_birth, program, year) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction((items: typeof students) => {
    for (const s of items) {
      insert.run(s.first_name, s.last_name, s.email, s.date_of_birth, s.program, s.year);
    }
  });

  insertMany(students);
  console.log("✅ Sample students seeded");
}

export {};
