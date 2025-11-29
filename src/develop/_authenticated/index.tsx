import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/develop/(views)/official/dashboard'

export const Route = createFileRoute('/_authenticated/')({
     component: Dashboard,
})
