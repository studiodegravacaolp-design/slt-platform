/**
 * Canonical public schema surface. bigint values are delivered by PostgREST as
 * strings, preserving precision beyond JavaScript's safe integer range.
 *
 * Column-level generated types must be imported from the canonical project
 * schema when database access is available. Until then we deliberately model
 * no unverified fields, relationships, or enums.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type CanonicalTable = {
  Row: Record<string, unknown>
  Insert: Record<string, unknown>
  Update: Record<string, unknown>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      organizations: CanonicalTable
      units: CanonicalTable
      modalities: CanonicalTable
      students: CanonicalTable
      student_modality_units: CanonicalTable
      trainings: CanonicalTable
      training_exercises: CanonicalTable
      attendance: CanonicalTable
      evaluations: CanonicalTable
      evaluation_results: CanonicalTable
      users: CanonicalTable
      plans: CanonicalTable
      student_plans: CanonicalTable
      charges: CanonicalTable
      payments: CanonicalTable
    }
    Views: Record<string, never>
    Functions: {
      current_user_organization_id: { Args: Record<PropertyKey, never>; Returns: string | null }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
