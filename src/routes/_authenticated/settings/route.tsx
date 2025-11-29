import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/routes/(views)/settings'

export const Route = createFileRoute('/_authenticated/settings')({
     component: Settings,
})
