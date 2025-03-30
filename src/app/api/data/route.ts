import { NextResponse } from "next/server";

const statuses = ["ACTIVE", "INACTIVE", "BLOCKED"];
const generateData = () => {
  return Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString(),
    about: {
      name: `Demo Demo ${i + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      email: `demo.d${i + 1}@demo.com`,
    },
    details: {
      date: `2025-03-${i < 9 ? `0${i + 1}` : i + 1}`,
      invitedBy: `Dem ${i + 1}`,
    },
  }));
};

const records = generateData();
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return NextResponse.json({
    data: records.slice(start, end),
    total: records.length,
  });
}

// export async function GET() {
//   return NextResponse.json({ data: records });
// }