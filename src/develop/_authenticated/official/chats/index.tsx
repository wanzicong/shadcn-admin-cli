import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/develop/(views)/official/chats'

export const Route = createFileRoute('/_authenticated/official/chats/')({
     component: Chats,
})
