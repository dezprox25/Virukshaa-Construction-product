import { NextRequest, NextResponse } from 'next/server'
import connectToDB from '@/lib/db'
import Project from '@/models/ProjectModel'
import Client from '@/models/ClientModel'

export async function GET(req: NextRequest) {
  await connectToDB()

  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('clientEmail')

    if (!email) {
      return NextResponse.json({ error: 'Email not provided' }, { status: 400 })
    }

    const client = await Client.findOne({ email })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const projects = await Project.find({ clientId: client._id })

    let totalAmount = 0
    let totalPaid = 0
    const payments = projects.map((project) => {
      totalAmount += project.totalAmount
      totalPaid += project.amountPaid || 0

      return {
        name: project.name,
        amount: project.totalAmount,
        paid: project.amountPaid || 0,
        dueDate: project.dueDate,
        status: (project.amountPaid || 0) >= project.totalAmount ? 'Paid' : 'Pending'
      }
    })

    return NextResponse.json({
      totalAmount,
      totalPaid,
      pending: totalAmount - totalPaid,
      payments
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
