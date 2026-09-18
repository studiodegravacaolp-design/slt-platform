'use server'
import { redirect } from 'next/navigation'
import { createStudent, updateStudent } from '@/services/students'
import { studentCreateSchema, studentUpdateSchema } from '@/validations/student'
export type StudentFormState = { status: 'idle' | 'error'; message?: string; fieldErrors?: Record<string, string[]> }
function normalizeFormData(formData: FormData) { return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, typeof value === 'string' && value.trim() === '' ? undefined : value])) }
function invalidState(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }): StudentFormState { return { status: 'error', message: 'Revise os campos destacados.', fieldErrors: Object.fromEntries(Object.entries(error.flatten().fieldErrors).filter(([, value]) => value !== undefined)) as Record<string, string[]> } }
export async function createStudentAction(_: StudentFormState, formData: FormData): Promise<StudentFormState> { const parsed = studentCreateSchema.safeParse(normalizeFormData(formData)); if (!parsed.success) return invalidState(parsed.error); let student; try { student = await createStudent(parsed.data) } catch { return { status: 'error', message: 'Não foi possível cadastrar o aluno. Tente novamente.' } }; redirect(`/students/${student.id}`) }
export async function updateStudentAction(studentId: number, _: StudentFormState, formData: FormData): Promise<StudentFormState> { const parsed = studentUpdateSchema.safeParse(normalizeFormData(formData)); if (!parsed.success) return invalidState(parsed.error); try { await updateStudent(studentId, parsed.data) } catch { return { status: 'error', message: 'Não foi possível atualizar o aluno. Tente novamente.' } }; redirect(`/students/${studentId}`) }
