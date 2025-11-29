import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/develop/(views)/dashboard'

export const Route = createFileRoute('/_authenticated/')({
     component: Dashboard,
})
