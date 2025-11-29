import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/develop/(views)/official/auth/forgot-password'

export const Route = createFileRoute('/(auth)/forgot-password')({
     component: ForgotPassword,
})
