import { createFileRoute } from '@tanstack/react-router'
import { ForbiddenError } from '@/routes/(views)/errors/forbidden'

export const Route = createFileRoute('/(errors)/403')({
     component: ForbiddenError,
})
