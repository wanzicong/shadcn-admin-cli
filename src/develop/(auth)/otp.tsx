import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/develop/(views)/official/auth/otp'

export const Route = createFileRoute('/(auth)/otp')({
     component: Otp,
})
