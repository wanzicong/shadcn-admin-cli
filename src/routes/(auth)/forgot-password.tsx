import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/routes/(views)/auth/forgot-password'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: ForgotPassword,
})
