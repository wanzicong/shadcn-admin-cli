import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/routes/(views)/auth/otp'

export const Route = createFileRoute('/(auth)/otp')({
  component: Otp,
})
