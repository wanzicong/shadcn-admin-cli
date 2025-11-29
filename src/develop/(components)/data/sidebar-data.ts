import { menus } from '@/develop/(components)/data/navGroups.ts'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../layout/types.ts'

export const sidebarData: SidebarData = {
     user: {
          name: 'satnaing',
          email: 'satnaingdev@gmail.com',
          avatar: '/avatars/shadcn.jpg',
     },
     teams: [
          {
               name: 'Shadcn Admin',
               logo: Command,
               plan: 'Vite + ShadcnUI',
          },
          {
               name: 'Acme Inc',
               logo: GalleryVerticalEnd,
               plan: 'Enterprise',
          },
          {
               name: 'Acme Corp.',
               logo: AudioWaveform,
               plan: 'Startup',
          },
     ],
     navGroups: menus,
}
