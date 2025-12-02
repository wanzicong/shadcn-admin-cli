import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailPlus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { SelectDropdown } from '@/components/select-dropdown.tsx'
import type { UserRole } from '@/develop/(services)/api/types'
import { roles } from '../../data/data.ts'
import { useUsers } from '../../context/use-users.tsx'

const formSchema = z.object({
     email: z.email({
          error: (iss) => (iss.input === '' ? 'Please enter an email to invite.' : undefined),
     }),
     role: z.string().min(1, 'Role is required.'),
     desc: z.string().optional(),
})

type UserInviteForm = z.infer<typeof formSchema>

type UserInviteDialogProps = {
     open: boolean
     onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({ open, onOpenChange }: UserInviteDialogProps) {
     // 从 Context 获取邀请方法和加载状态
     const { inviteUser, isInviting } = useUsers()
     
     const form = useForm<UserInviteForm>({
          resolver: zodResolver(formSchema),
          defaultValues: { email: '', role: '', desc: '' },
     })

     const onSubmit = (values: UserInviteForm) => {
          // 调用 API 邀请用户（只传递 email 和 role，desc 字段用于前端显示，不发送到后端）
          inviteUser({
               email: values.email,
               role: values.role as UserRole, // 类型转换，因为 role 是字符串
          })
          
          // 重置表单
          form.reset()
          // 关闭对话框
          onOpenChange(false)
     }

     return (
          <Dialog
               open={open}
               onOpenChange={(state) => {
                    form.reset()
                    onOpenChange(state)
               }}
          >
               <DialogContent className='sm:max-w-md'>
                    <DialogHeader className='text-start'>
                         <DialogTitle className='flex items-center gap-2'>
                              <MailPlus /> Invite User
                         </DialogTitle>
                         <DialogDescription>
                              Invite new user to join your team by sending them an email invitation. Assign a role to define their access level.
                         </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                         <form id='user-invite-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                              <FormField
                                   control={form.control}
                                   name='email'
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Email</FormLabel>
                                             <FormControl>
                                                  <Input type='email' placeholder='eg: john.doe@gmail.com' {...field} />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   control={form.control}
                                   name='role'
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Role</FormLabel>
                                             <SelectDropdown
                                                  defaultValue={field.value}
                                                  onValueChange={field.onChange}
                                                  placeholder='Select a role'
                                                  items={roles.map(({ label, value }) => ({
                                                       label,
                                                       value,
                                                  }))}
                                             />
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   control={form.control}
                                   name='desc'
                                   render={({ field }) => (
                                        <FormItem className=''>
                                             <FormLabel>Description (optional)</FormLabel>
                                             <FormControl>
                                                  <Textarea
                                                       className='resize-none'
                                                       placeholder='Add a personal note to your invitation (optional)'
                                                       {...field}
                                                  />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                         </form>
                    </Form>
                    <DialogFooter className='gap-y-2'>
                         <DialogClose asChild>
                              <Button variant='outline'>Cancel</Button>
                         </DialogClose>
                         <Button type='submit' form='user-invite-form' disabled={isInviting}>
                              {isInviting ? 'Inviting...' : 'Invite'} <Send />
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     )
}
