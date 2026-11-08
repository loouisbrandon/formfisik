'use client'
import {ScreenError} from '@/modules/feedback/screen-error'
export default function AppError({reset}:{reset:()=>void}){return <ScreenError reset={reset}/>}
