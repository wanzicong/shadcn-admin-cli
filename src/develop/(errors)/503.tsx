import { createFileRoute } from '@tanstack/react-router'
import { MaintenanceError } from '@/develop/(views)/errors/maintenance-error'

export const Route = createFileRoute('/(errors)/503')({
     component: MaintenanceError,
})
