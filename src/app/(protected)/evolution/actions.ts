'use server'
import { revalidatePath } from 'next/cache'
import { createEvaluation, createEvaluationResult, deleteEvaluationResult, updateEvaluation, updateEvaluationResult } from '@/services/evaluations'
import { evaluationCreateSchema, evaluationResultCreateSchema, evaluationResultUpdateSchema, evaluationUpdateSchema } from '@/validations/evaluation'
const values=(f:FormData)=>Object.fromEntries([...f].map(([k,v])=>[k,v===''?undefined:v]))
export async function createEvaluationAction(f:FormData){const e=await createEvaluation(evaluationCreateSchema.parse(values(f)));revalidatePath('/evolution');return e.id}
export async function updateEvaluationAction(id:number,f:FormData){await updateEvaluation(id,evaluationUpdateSchema.parse(values(f)));revalidatePath(`/evolution/${id}`)}
export async function addEvaluationResultAction(id:number,f:FormData){await createEvaluationResult(id,evaluationResultCreateSchema.parse(values(f)));revalidatePath(`/evolution/${id}`)}
export async function updateEvaluationResultAction(evaluationId:number,id:number,f:FormData){await updateEvaluationResult(id,evaluationResultUpdateSchema.parse(values(f)));revalidatePath(`/evolution/${evaluationId}`)}
export async function removeEvaluationResultAction(evaluationId:number,f:FormData){await deleteEvaluationResult(Number(f.get('result_id')));revalidatePath(`/evolution/${evaluationId}`)}
