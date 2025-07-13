import { NextResponse } from "next/server"

// Mock data for projects
const projects = [
  {
    id: 1,
    name: "Downtown Office Complex",
    status: "In Progress",
    progress: 75,
    manager: "John Smith",
    budget: 450000,
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    client: "ABC Corporation",
  },
  {
    id: 2,
    name: "Residential Tower A",
    status: "Planning",
    progress: 25,
    manager: "Sarah Johnson",
    budget: 280000,
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    client: "XYZ Developers",
  },
  {
    id: 3,
    name: "Shopping Mall Renovation",
    status: "Completed",
    progress: 100,
    manager: "Mike Davis",
    budget: 320000,
    startDate: "2023-06-01",
    endDate: "2024-11-30",
    client: "Mall Management Co.",
  },
]

export async function GET() {
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newProject = {
    id: projects.length + 1,
    ...body,
    status: "Planning",
    progress: 0,
  }
  projects.push(newProject)
  return NextResponse.json(newProject, { status: 201 })
}
