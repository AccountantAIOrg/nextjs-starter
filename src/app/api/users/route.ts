import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/krutai-server";

export async function GET() {
  try {
    const prisma = await getPrisma();
    
    // Example: Fetch all users using Prisma
    const users = await prisma.user.findMany({
      include: {
        sessions: true,
      }
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
