import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@/develop/(views)/official/auth/sign-up'

export const Route = createFileRoute('/(auth)/sign-up')({
     component: SignUp,
})
