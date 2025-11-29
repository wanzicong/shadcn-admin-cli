import { createFileRoute } from '@tanstack/react-router'
import { NotFoundError } from '@/develop/(views)/official/errors/not-found-error'

export const Route = createFileRoute('/(errors)/404')({
     component: NotFoundError,
})
