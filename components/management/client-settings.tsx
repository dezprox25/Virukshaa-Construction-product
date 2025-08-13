'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Client {
  _id: string
  name: string
  email: string
  phone: string
  company?: string
  address: string
  city: string
  state: string
  postalCode: string
  taxId?: string
  website?: string
  status: 'Active' | 'Inactive'
  projectTotalAmount: number
  totalPaid?: number
  dueAmount?: number
  lastPaymentDate?: string | null
  avatar?: string
}

export default function ClientSettings() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const clientEmail = localStorage.getItem('clientEmail')

    if (!clientEmail) {
      console.log('Client not logged in. Redirecting...')
      router.push('/client/login')
      return
    }

    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/clients?email=${clientEmail}`)
        const data = await res.json()

        if (res.ok && data && data.email) {
          setClient(data)
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            company: data.company || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            postalCode: data.postalCode || '',
          })
        } else {
          console.error('Client not found or bad data:', data)
        }
      } catch (err) {
        console.error('Failed to fetch client:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveChanges = async () => {
    if (!client?.email) return

    try {
      const res = await fetch(`/api/clients?email=${client.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updatedClient = await res.json()
        toast.success('✅ Client updated successfully!')
        setClient(updatedClient)
      } else {
        toast.error('❌ Failed to update client.')
      }
    } catch (error) {
      console.error(error)
      toast.error('❌ Error while updating client.')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!client) return <div>No client data found.</div>

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Client Settings</h2>
      <form className="grid gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            className="w-full border px-3 py-2 rounded"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="w-full border px-3 py-2 rounded bg-gray-100"
            type="email"
            value={client.email}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            name="phone"
            className="w-full border px-3 py-2 rounded"
            type="text"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Company</label>
          <input
            name="company"
            className="w-full border px-3 py-2 rounded"
            type="text"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            name="address"
            className="w-full border px-3 py-2 rounded"
            type="text"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              name="city"
              className="w-full border px-3 py-2 rounded"
              type="text"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">State</label>
            <input
              name="state"
              className="w-full border px-3 py-2 rounded"
              type="text"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Postal Code</label>
          <input
            name="postalCode"
            className="w-full border px-3 py-2 rounded"
            type="text"
            value={formData.postalCode}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
