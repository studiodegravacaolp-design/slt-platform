'use server'
import { redirect } from 'next/navigation'; import { createTraining, updateTraining, updateTrainingStatus, createTrainingExercise, updateTrainingExercise, deleteTrainingExercise, reorderTrainingExercises } from '@/services/trainings'
const data=(f:FormData)=>Object.fromEntries([...f].map(([k,v])=>[k,v===''?undefined:v]))
export async function createTrainingAction(studentId:number,f:FormData){const t=await createTraining(studentId,data(f));redirect(`/trainings/${t.id}`)}
export async function saveTrainingAction(id:number,f:FormData){await updateTraining(id,data(f));redirect(`/trainings/${id}`)}
export async function statusTrainingAction(id:number,f:FormData){await updateTrainingStatus(id,String(f.get('status')));redirect(`/trainings/${id}`)}
export async function addExerciseAction(id:number,f:FormData){await createTrainingExercise(id,data(f));redirect(`/trainings/${id}`)}
export async function updateExerciseAction(trainingId:number,exerciseId:number,f:FormData){await updateTrainingExercise(exerciseId,data(f));redirect(`/trainings/${trainingId}`)}
export async function removeExerciseAction(id:number,f:FormData){await deleteTrainingExercise(Number(f.get('exercise_id')));redirect(`/trainings/${id}`)}
export async function orderExercisesAction(id:number,f:FormData){await reorderTrainingExercises(id,String(f.get('ids')).split(',').map(Number));redirect(`/trainings/${id}`)}
