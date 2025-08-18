"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Project = {
  _id: string
  title: string
}

type Employee = {
  _id: string
  name: string
  role?: string
}

type ReportItem = {
  _id: string
  title: string
  projectId?: string
  siteUpdate?: string
  employeeSummary?: string
  queries?: string
  employees?: string[]
  date?: string
}

const SupervisorReports: React.FC = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [reports, setReports] = useState<ReportItem[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    projectId: '',
    siteUpdate: '',
    employeeSummary: '',
    queries: '',
    employees: [] as string[],
  })

  useEffect(() => {
    // Load projects and employees for selection
    const loadData = async () => {
      try {
        const supervisorId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
        const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
        const projUrl = supervisorId && role === 'supervisor' ? `/api/projects?supervisorId=${encodeURIComponent(supervisorId)}` : '/api/projects'
        const empUrl = supervisorId && role === 'supervisor' ? `/api/supervisors/${encodeURIComponent(supervisorId)}/employees` : '/api/employees'
        const [pRes, eRes] = await Promise.all([
          fetch(projUrl, { cache: 'no-store' }),
          fetch(empUrl, { cache: 'no-store' }),
        ])
        const [pData, eData] = await Promise.all([pRes.json(), eRes.json()])
        setProjects(Array.isArray(pData) ? pData : [])
        setEmployees(Array.isArray(eData) ? eData : [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load projects or employees')
      }
    }
    loadData()
  }, [toast])

  // Load my reports
  useEffect(() => {
    const loadReports = async () => {
      try {
        setReportsLoading(true)
        const supervisorId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
        if (!supervisorId) {
          setReports([])
          return
        }
        const res = await fetch(`/api/reports?type=supervisor&supervisorId=${encodeURIComponent(supervisorId)}`, { cache: 'no-store' })
        const data = await res.json()
        setReports(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      } finally {
        setReportsLoading(false)
      }
    }
    loadReports()
  }, [])

  const canSubmit = useMemo(() => {
    return form.title.trim().length > 0 && form.projectId !== '' && !loading
  }, [form, loading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleEmployee = (id: string) => {
    setForm((prev) => {
      const exists = prev.employees.includes(id)
      return { ...prev, employees: exists ? prev.employees.filter(e => e !== id) : [...prev.employees, id] }
    })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const supervisorId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'supervisor',
          title: form.title,
          projectId: form.projectId || undefined,
          siteUpdate: form.siteUpdate || undefined,
          employeeSummary: form.employeeSummary || undefined,
          queries: form.queries || undefined,
          employees: form.employees,
          supervisorId: supervisorId || undefined,
          date: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || err?.message || 'Failed to submit report')
      }
      // Reset form
      setForm({
        title: '',
        projectId: '',
        siteUpdate: '',
        employeeSummary: '',
        queries: '',
        employees: [],
      })
      toast.success('Report submitted successfully')
      // reload reports
      try {
        const sid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
        if (sid) {
          const r = await fetch(`/api/reports?type=supervisor&supervisorId=${encodeURIComponent(sid)}`, { cache: 'no-store' })
          const d = await r.json()
          setReports(Array.isArray(d) ? d : [])
        }
      } catch {}
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  const loadForEdit = (rep: ReportItem) => {
    setEditingId(rep._id)
    setForm({
      title: rep.title || '',
      projectId: rep.projectId || '',
      siteUpdate: rep.siteUpdate || '',
      employeeSummary: rep.employeeSummary || '',
      queries: rep.queries || '',
      employees: rep.employees || [],
    })
  }

  const onUpdate = async () => {
    if (!editingId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          projectId: form.projectId || undefined,
          siteUpdate: form.siteUpdate || undefined,
          employeeSummary: form.employeeSummary || undefined,
          queries: form.queries || undefined,
          employees: form.employees,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || err?.message || 'Failed to update report')
      }
      toast.success('Report updated')
      setEditingId(null)
      // refresh list
      const sid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      if (sid) {
        const r = await fetch(`/api/reports?type=supervisor&supervisorId=${encodeURIComponent(sid)}`, { cache: 'no-store' })
        const d = await r.json()
        setReports(Array.isArray(d) ? d : [])
      }
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Failed to update report')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || err?.message || 'Delete failed')
      }
      setReports((prev) => prev.filter(r => r._id !== id))
      if (editingId === id) {
        setEditingId(null)
        setForm({ title: '', projectId: '', siteUpdate: '', employeeSummary: '', queries: '', employees: [] })
      }
      toast.success('Report deleted')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Failed to delete')
    }
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: form */}
      <div className="w-full p-4 md:p-6 bg-white rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Supervisor Daily Report</h2>
        <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="title">Report Title</Label>
          <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Site A - Daily Update" required />
        </div>

        <div className="grid gap-2">
          <Label>Project</Label>
          <Select value={form.projectId} onValueChange={(val) => setForm((p) => ({ ...p, projectId: val }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="siteUpdate">Site Update</Label>
          <Textarea id="siteUpdate" name="siteUpdate" value={form.siteUpdate} onChange={handleChange} rows={4} placeholder="Work completed, issues faced, materials received, etc." />
        </div>

        

        <div className="grid gap-2">
          <Label htmlFor="employeeSummary">Employee Summary</Label>
          <Textarea id="employeeSummary" name="employeeSummary" value={form.employeeSummary} onChange={handleChange} rows={3} placeholder="Attendance, performance, shifts, safety notes" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="queries">Queries/Issues</Label>
          <Textarea id="queries" name="queries" value={form.queries} onChange={handleChange} rows={3} placeholder="Any questions or support needed" />
        </div>

        <div className="grid gap-2">
          <Label>Related Employees</Label>
          <div className="max-h-48 overflow-auto rounded border p-2 space-y-1">
            {employees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No employees found</p>
            ) : (
              employees.map((emp) => (
                <label key={emp._id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.employees.includes(emp._id)}
                    onChange={() => toggleEmployee(emp._id)}
                  />
                  <span>{emp.name}{emp.role ? ` - ${emp.role}` : ''}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {editingId ? (
            <>
              <Button type="button" onClick={onUpdate} disabled={!canSubmit || loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm({ title: '', projectId: '', siteUpdate: '', employeeSummary: '', queries: '', employees: [] }) }} disabled={loading}>
                Cancel
              </Button>
            </>
          ) : (
            <Button type="submit" disabled={!canSubmit}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => setForm({ title: '', projectId: '', siteUpdate: '', employeeSummary: '', queries: '', employees: [] })} disabled={loading}>
            Reset
          </Button>
        </div>
        </form>
      </div>

      {/* Right: my reports list */}
      <div className="w-full p-4 md:p-6 bg-white rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">My Reports</h3>
        {reportsLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="p-3 border rounded flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">{r.title}</p>
                  {r.date && (
                    <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleString()}</p>
                  )}
                  {r.projectId && (
                    <p className="text-sm underline"><span className="font-medium"></span> {projects.find(p => p._id === r.projectId)?.title || '—'}</p>
                  )}
                  {r.siteUpdate && (
                    <p className="text-sm"><span className="font-bold">Site Update:</span> {r.siteUpdate}</p>
                  )}
                  {r.employeeSummary && (
                    <p className="text-sm"><span className="font-bold">Employee Summary:</span> {r.employeeSummary}</p>
                  )}
                  {r.queries && (
                    <p className="text-sm"><span className="font-bold">Queries:</span> {r.queries}</p>
                  )}
                  {Array.isArray(r.employees) && r.employees.length > 0 && (
                    <p className="text-sm"><span className="font-bold">Employees:</span> {employees.filter(e => r.employees?.includes(e._id)).map(e => e.name).join(', ')}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => loadForEdit(r)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(r._id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SupervisorReports