import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/develop/(views)/chats'

export const Route = createFileRoute('/_authenticated/chats/')({
     component: Chats,
})
