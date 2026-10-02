'use server'
import{revalidatePath}from 'next/cache';import{createPlan,updatePlan,updatePlanStatus}from '@/services/plans';import{createStudentPlan,endStudentPlan}from '@/services/student-plans';import{createCharge}from '@/services/charges';import{createPayment}from '@/services/payments';import{planSchema}from '@/validations/plan';import{studentPlanSchema}from '@/validations/student-plan';import{chargeSchema}from '@/validations/charge';import{paymentSchema}from '@/validations/payment'
const data=(f:FormData)=>Object.fromEntries([...f].map(([k,v])=>[k,v===''?undefined:v]))
export async function savePlanAction(id:number|undefined,f:FormData){const p=planSchema.parse(data(f));if(id)await updatePlan(id,p);else await createPlan(p);revalidatePath('/financial')}
export async function planStatusAction(id:number,f:FormData){await updatePlanStatus(id,String(f.get('status')));revalidatePath('/financial')}
export async function createStudentPlanAction(f:FormData){await createStudentPlan(studentPlanSchema.parse(data(f)));revalidatePath('/financial')}
export async function endStudentPlanAction(id:number,f:FormData){await endStudentPlan(id,String(f.get('end_date')),String(f.get('status')));revalidatePath('/financial')}
export async function createChargeAction(f:FormData){await createCharge(chargeSchema.parse(data(f)));revalidatePath('/financial')}
export async function createPaymentAction(f:FormData){await createPayment(paymentSchema.parse(data(f)));revalidatePath('/financial')}
