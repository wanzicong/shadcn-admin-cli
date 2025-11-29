import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/routes/(views)/dashboard'

export const Route = createFileRoute('/_authenticated/')({
     component: Dashboard,
})
