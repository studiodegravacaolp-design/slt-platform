import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(resolve(process.cwd(), 'supabase/migrations/20261003194135_bootstrap_owner_profile_name.sql'), 'utf8')

describe('bootstrap owner profile migration', () => {
  it('derives the authenticated identity from auth.uid and profile name from metadata', () => {
    expect(migration).toContain('v_user_id uuid := auth.uid();')
    expect(migration).toContain("raw_user_meta_data ->> 'name'")
    expect(migration).toContain("values (v_user_id, v_org.id, v_person_name, v_email);")
  })

  it('does not use metadata for organization or authorization data', () => {
    expect(migration).not.toContain('raw_user_meta_data ->> \'organization_id\'')
    expect(migration).not.toContain('raw_user_meta_data ->> \'role\'')
  })
})
