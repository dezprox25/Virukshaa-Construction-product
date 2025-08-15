import { NextResponse } from 'next/server'
import connectToDB from '@/lib/db'
import LoginCredential from '@/models/LoginCredential'
import AdminProfile from '@/models/AdminProfile'
import Supervisor from '@/models/Supervisor'
import Client from '@/models/ClientModel'
import bcrypt from 'bcryptjs'

function isBcryptHash(val?: string): boolean {
  return !!val && (val.startsWith('$2a$') || val.startsWith('$2b$') || val.startsWith('$2y$'))
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function POST(req: Request) {
  try {
    const { email, username, identifier: idFromBody, password } = await req.json()
    const identifier: string | undefined = (idFromBody || username || email)?.trim()

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email or username and password are required' },
        { status: 400 }
      )
    }

    await connectToDB()

    const regex = new RegExp(`^${escapeRegExp(identifier)}$`, 'i')
    console.log('[auth/login] identifier received:', identifier)

    // 1) Try LoginCredential collection first (may have multiple across roles)
    const candidates = await LoginCredential.find({
      $or: [{ email: regex }, { username: regex }]
    }).select('+password')
    console.log('[auth/login] credential candidates found:', candidates.length)
    let cred = undefined as typeof candidates[number] | undefined

    // 2) If not found, attempt to discover from legacy collections and create credential
    if (!candidates || candidates.length === 0) {
      // Admin
      const admin = await AdminProfile.findOne({ $or: [{ email: regex }, { username: regex }] }).select('+password')
      console.log('[auth/login] legacy admin found:', !!admin)
      if (admin) {
        const hashed = isBcryptHash((admin as any).password)
          ? (admin as any).password
          : await bcrypt.hash((admin as any).password ?? '', 10)
        const created = await LoginCredential.create({
          email: admin.email?.toLowerCase(),
          username: (admin as any).username?.toLowerCase?.() ?? undefined,
          password: hashed,
          role: 'superadmin',
          profileId: admin._id,
          name: (admin as any).adminName,
        })
        console.log('[auth/login] created credential from admin profile:', created?._id?.toString())
        candidates.push(created as any)
      }
    }

    if (!candidates || candidates.length === 0) {
      // Supervisor
      const sup = await Supervisor.findOne({ $or: [{ email: regex }, { username: regex }] }).select('+password')
      console.log('[auth/login] legacy supervisor found:', !!sup)
      if (sup) {
        const hashed = isBcryptHash((sup as any).password)
          ? (sup as any).password
          : await bcrypt.hash((sup as any).password ?? '', 10)
        const created = await LoginCredential.create({
          email: sup.email?.toLowerCase(),
          username: (sup as any).username?.toLowerCase?.() ?? undefined,
          password: hashed,
          role: 'supervisor',
          profileId: sup._id,
          name: (sup as any).name,
        })
        console.log('[auth/login] created credential from supervisor:', created?._id?.toString())
        candidates.push(created as any)
      }
    }

    if (!candidates || candidates.length === 0) {
      // Client
      const cli = await Client.findOne({ $or: [{ email: regex }, { username: regex }] }).select('+password')
      console.log('[auth/login] legacy client found:', !!cli)
      if (cli) {
        const hashed = isBcryptHash((cli as any).password)
          ? (cli as any).password
          : await bcrypt.hash((cli as any).password ?? '', 10)
        const created = await LoginCredential.create({
          email: cli.email?.toLowerCase(),
          username: (cli as any).username?.toLowerCase?.() ?? undefined,
          password: hashed,
          role: 'client',
          profileId: cli._id,
          name: (cli as any).name,
        })
        console.log('[auth/login] created credential from client:', created?._id?.toString())
        candidates.push(created as any)
      }
    }

    if (!candidates || candidates.length === 0) {
      console.log('[auth/login] no user found in any collection for identifier')
      return NextResponse.json({ error: 'Invalid email/username or password' }, { status: 401 })
    }

    // 3) Iterate candidates; authenticate first that matches
    for (const c of candidates) {
      const stored = (c as any).password as string | undefined
      let ok = false
      if (isBcryptHash(stored)) {
        ok = await bcrypt.compare(password, stored!)
        console.log('[auth/login] bcrypt compare result for candidate:', ok)
      } else {
        ok = stored === password
        if (ok) {
          ;(c as any).password = await bcrypt.hash(password, 10)
          await (c as any).save()
          console.log('[auth/login] migrated plaintext password to bcrypt for credential:', (c as any)?._id?.toString())
        }
      }
      if (ok) {
        cred = c
        break
      }
    }

    if (!cred) {
      console.log('[auth/login] password mismatch for all candidates')
      return NextResponse.json({ error: 'Invalid email/username or password' }, { status: 401 })
    }

    const obj = cred.toObject()
    const { password: _pw, ...safe } = obj

    return NextResponse.json({ success: true, user: safe })
  } catch (error) {
    console.error('Unified login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
