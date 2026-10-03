import { createClient } from '@/lib/supabase/server'
import { getCurrentOrganization } from '@/services/organizations'
import type { Tables } from '@/types/supabase'

const dashboardTimeZone = 'America/Sao_Paulo'
const recentActivityLimit = 5

type Reference = Pick<Tables<'students'>, 'id' | 'full_name' | 'social_name'> | Pick<Tables<'units'>, 'id' | 'name'> | Pick<Tables<'modalities'>, 'id' | 'name'>

export type DashboardRecentAttendance = { id: number; date: string; status: string; studentName: string | null; unitName: string | null; modalityName: string | null }
export type DashboardRecentEvaluation = { id: number; date: string; type: string; studentName: string | null; modalityName: string | null }
export type OrganizationOverview = {
  organization: { id: number; name: string }
  totalUnits: number
  mainUnit: { id: number; name: string } | null
  totalModalities: number
  totalStudents: number
  todayAttendanceCount: number
  totalEvaluations: number
  totalCharges: number
  recentAttendance: DashboardRecentAttendance[]
  recentEvaluations: DashboardRecentEvaluation[]
}

export function getOperationalDate(date = new Date(), timeZone = dashboardTimeZone): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function ids(rows: Array<{ id: number }>) { return [...new Set(rows.map((row) => row.id))] }
function namesById(rows: Reference[]) { return new Map(rows.map((row) => [row.id, 'social_name' in row ? row.social_name || row.full_name : row.name])) }

export function buildRecentAttendance(rows: Pick<Tables<'attendance'>, 'id' | 'date' | 'status' | 'student_id' | 'unit_id' | 'modality_id'>[], students: Array<Pick<Tables<'students'>, 'id' | 'full_name' | 'social_name'>>, units: Array<Pick<Tables<'units'>, 'id' | 'name'>>, modalities: Array<Pick<Tables<'modalities'>, 'id' | 'name'>>): DashboardRecentAttendance[] {
  const studentNames = namesById(students)
  const unitNames = namesById(units)
  const modalityNames = namesById(modalities)
  return rows.map((row) => ({ id: row.id, date: row.date, status: row.status, studentName: studentNames.get(row.student_id) ?? null, unitName: unitNames.get(row.unit_id) ?? null, modalityName: modalityNames.get(row.modality_id) ?? null }))
}

export function buildRecentEvaluations(rows: Pick<Tables<'evaluations'>, 'id' | 'date' | 'type' | 'student_id' | 'modality_id'>[], students: Array<Pick<Tables<'students'>, 'id' | 'full_name' | 'social_name'>>, modalities: Array<Pick<Tables<'modalities'>, 'id' | 'name'>>): DashboardRecentEvaluation[] {
  const studentNames = namesById(students)
  const modalityNames = namesById(modalities)
  return rows.map((row) => ({ id: row.id, date: row.date, type: row.type, studentName: studentNames.get(row.student_id) ?? null, modalityName: modalityNames.get(row.modality_id) ?? null }))
}

/** Builds a factual organization-scoped overview; RLS remains the final authorization boundary. */
export async function getOrganizationOverview(): Promise<OrganizationOverview> {
  const organization = await getCurrentOrganization()
  const supabase = await createClient()
  const today = getOperationalDate()
  const [unitCount, mainUnit, modalityCount, studentCount, attendanceToday, evaluationCount, chargeCount, attendanceRows, evaluationRows] = await Promise.all([
    supabase.from('units').select('*', { count: 'exact', head: true }).eq('organization_id', organization.id),
    supabase.from('units').select('id, name').eq('organization_id', organization.id).eq('is_main', true).eq('status', 'active').maybeSingle(),
    supabase.from('modalities').select('id, units!inner(organization_id)', { count: 'exact', head: true }).eq('units.organization_id', organization.id),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('organization_id', organization.id),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('organization_id', organization.id).eq('date', today),
    supabase.from('evaluations').select('*', { count: 'exact', head: true }).eq('organization_id', organization.id),
    supabase.from('charges').select('*', { count: 'exact', head: true }).eq('organization_id', organization.id),
    supabase.from('attendance').select('id, date, status, student_id, unit_id, modality_id').eq('organization_id', organization.id).order('date', { ascending: false }).order('created_at', { ascending: false }).limit(recentActivityLimit),
    supabase.from('evaluations').select('id, date, type, student_id, modality_id').eq('organization_id', organization.id).order('date', { ascending: false }).order('created_at', { ascending: false }).limit(recentActivityLimit),
  ])
  if (unitCount.error || mainUnit.error || modalityCount.error || studentCount.error || attendanceToday.error || evaluationCount.error || chargeCount.error || attendanceRows.error || evaluationRows.error) throw new Error('Não foi possível carregar o resumo operacional da organização.')

  const attendance = attendanceRows.data
  const evaluations = evaluationRows.data
  const studentIds = ids([...attendance.map(({ student_id }) => ({ id: student_id })), ...evaluations.map(({ student_id }) => ({ id: student_id }))])
  const modalityIds = ids([...attendance.map(({ modality_id }) => ({ id: modality_id })), ...evaluations.map(({ modality_id }) => ({ id: modality_id }))])
  const unitIds = ids(attendance.map(({ unit_id }) => ({ id: unit_id })))
  const [students, units, modalities] = await Promise.all([
    studentIds.length ? supabase.from('students').select('id, full_name, social_name').eq('organization_id', organization.id).in('id', studentIds) : Promise.resolve({ data: [], error: null }),
    unitIds.length ? supabase.from('units').select('id, name').eq('organization_id', organization.id).in('id', unitIds) : Promise.resolve({ data: [], error: null }),
    modalityIds.length ? supabase.from('modalities').select('id, name, units!inner(organization_id)').in('id', modalityIds).eq('units.organization_id', organization.id) : Promise.resolve({ data: [], error: null }),
  ])
  if (students.error || units.error || modalities.error) throw new Error('Não foi possível carregar a atividade recente da organização.')

  return {
    organization: { id: organization.id, name: organization.name }, totalUnits: unitCount.count ?? 0,
    mainUnit: mainUnit.data ? { id: mainUnit.data.id, name: mainUnit.data.name } : null,
    totalModalities: modalityCount.count ?? 0, totalStudents: studentCount.count ?? 0,
    todayAttendanceCount: attendanceToday.count ?? 0, totalEvaluations: evaluationCount.count ?? 0, totalCharges: chargeCount.count ?? 0,
    recentAttendance: buildRecentAttendance(attendance, students.data, units.data, modalities.data),
    recentEvaluations: buildRecentEvaluations(evaluations, students.data, modalities.data),
  }
}
