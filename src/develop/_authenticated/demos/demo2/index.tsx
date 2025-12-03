import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/demos/demo2/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/demos/demo2/"!</div>
}
