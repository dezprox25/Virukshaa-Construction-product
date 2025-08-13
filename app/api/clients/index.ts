// /pages/api/clients/index.ts
import { NextApiRequest, NextApiResponse } from "next"

const clients: any[] = [/* your JSON array pasted here or imported from a file */]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query
  const client = clients.find(c => c.email === email)
  if (client) {
    res.status(200).json(client)
  } else {
    res.status(404).json({ error: "Client not found" })
  }
}
