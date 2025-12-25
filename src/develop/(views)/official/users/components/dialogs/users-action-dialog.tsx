'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { PasswordInput } from '@/components/password-input.tsx'
import { SelectDropdown } from '@/components/select-dropdown.tsx'
import { LoaderCircle } from '@/components/loader-circle.tsx'
import { roles } from '../../data/data.ts'
import { type User } from '../../data/schema.ts'
import { usersApi } from '../../services/user-services.ts'

const formSchema = z
     .object({
          firstName: z.string().min(1, '名字是必填项。'),
          lastName: z.string().min(1, '姓氏是必填项。'),
          username: z.string().min(1, '用户名是必填项。'),
          phoneNumber: z.string().min(1, '电话号码是必填项。'),
          email: z.email({
               error: (iss) => (iss.input === '' ? '邮箱是必填项。' : undefined),
          }),
          password: z.string().transform((pwd) => pwd.trim()),
          role: z.string().min(1, '角色是必填项。'),
          confirmPassword: z.string().transform((pwd) => pwd.trim()),
          isEdit: z.boolean(),
     })
     .refine(
          (data) => {
               if (data.isEdit && !data.password) return true
               return data.password.length > 0
          },
          {
               message: '密码是必填项。',
               path: ['password'],
          }
     )
     .refine(
          ({ isEdit, password }) => {
               if (isEdit && !password) return true
               return password.length >= 8
          },
          {
               message: '密码至少需要8个字符。',
               path: ['password'],
          }
     )
     .refine(
          ({ isEdit, password }) => {
               if (isEdit && !password) return true
               return /[a-z]/.test(password)
          },
          {
               message: '密码必须包含至少一个小写字母。',
               path: ['password'],
          }
     )
     .refine(
          ({ isEdit, password }) => {
               if (isEdit && !password) return true
               return /\d/.test(password)
          },
          {
               message: '密码必须包含至少一个数字。',
               path: ['password'],
          }
     )
     .refine(
          ({ isEdit, password, confirmPassword }) => {
               if (isEdit && !password) return true
               return password === confirmPassword
          },
          {
               message: '密码不匹配。',
               path: ['confirmPassword'],
          }
     )
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
     currentRow?: User
     open: boolean
     onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: UserActionDialogProps) {
     const isEdit = !!currentRow
     const queryClient = useQueryClient()
     const [isSubmitting, setIsSubmitting] = React.useState(false)

     const form = useForm<UserForm>({
          resolver: zodResolver(formSchema),
          defaultValues: isEdit
               ? {
                      ...currentRow,
                      password: '',
                      confirmPassword: '',
                      isEdit,
                 }
               : {
                      firstName: '',
                      lastName: '',
                      username: '',
                      email: '',
                      role: '',
                      phoneNumber: '',
                      password: '',
                      confirmPassword: '',
                      isEdit,
                 },
     })

     const onSubmit = async (values: UserForm) => {
          setIsSubmitting(true)
          try {
               if (isEdit && currentRow) {
                    // 更新用户
                    const { confirmPassword, isEdit, ...updateData } = values
                    await usersApi.updateUser(currentRow.id, updateData)
                    toast.success('用户更新成功')
               } else {
                    // 创建新用户
                    const { confirmPassword, isEdit, ...createData } = values
                    await usersApi.createUser(createData)
                    toast.success('用户创建成功')
               }

               // 刷新用户列表
               queryClient.invalidateQueries({ queryKey: ['users'] })

               form.reset()
               onOpenChange(false)
          } catch (error) {
               // eslint-disable-next-line no-console
               console.error('操作失败:', error)
               const errorMessage = error instanceof Error ? error.message : '操作失败，请重试'
               toast.error(errorMessage)
          } finally {
               setIsSubmitting(false)
          }
     }

     const isPasswordTouched = !!form.formState.dirtyFields.password

     return (
          <Dialog
               open={open}
               onOpenChange={(state) => {
                    if (!isSubmitting) {
                         form.reset()
                         onOpenChange(state)
                    }
               }}
          >
               <DialogContent className='sm:max-w-lg'>
                    <DialogHeader className='text-start'>
                         <DialogTitle>{isEdit ? '编辑用户' : '添加新用户'}</DialogTitle>
                         <DialogDescription>
                              {isEdit ? '在此处更新用户信息。' : '在此处创建新用户。'}
                              完成时请点击保存。
                         </DialogDescription>
                    </DialogHeader>
                    <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                         <Form {...form}>
                              <form id='user-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 px-0.5'>
                                   <FormField
                                        control={form.control}
                                        name='firstName'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>名字</FormLabel>
                                                  <FormControl>
                                                       <Input placeholder='请输入名字' className='col-span-4' autoComplete='off' {...field} disabled={isSubmitting} />
                                                  </FormControl>
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                                   <FormField
                                        control={form.control}
                                        name='lastName'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>姓氏</FormLabel>
                                                  <FormControl>
                                                       <Input placeholder='请输入姓氏' className='col-span-4' autoComplete='off' {...field} disabled={isSubmitting} />
                                                  </FormControl>
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                                   <FormField
                                        control={form.control}
                                        name='username'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>用户名</FormLabel>
                                                  <FormControl>
                                                       <Input placeholder='请输入用户名' className='col-span-4' {...field} disabled={isSubmitting} />
                                                  </FormControl>
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                                   <FormField
                                        control={form.control}
                                        name='email'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>邮箱</FormLabel>
                                                  <FormControl>
                                                       <Input placeholder='example@email.com' className='col-span-4' {...field} disabled={isSubmitting} />
                                                  </FormControl>
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                                   <FormField
                                        control={form.control}
                                        name='phoneNumber'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>电话号码</FormLabel>
                                                  <FormControl>
                                                       <Input placeholder='请输入电话号码' className='col-span-4' {...field} disabled={isSubmitting} />
                                                  </FormControl>
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                                   <FormField
                                        control={form.control}
                                        name='role'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>角色</FormLabel>
                                                  <SelectDropdown
                                                       defaultValue={field.value}
                                                       onValueChange={field.onChange}
                                                       placeholder='请选择角色'
                                                       className='col-span-4'
                                                       disabled={isSubmitting}
                                                       items={roles.map(({ label, value }) => ({
                                                            label,
                                                            value,
                                                       }))}
                                                  />
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                                   <FormField
                                        control={form.control}
                                        name='password'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>密码</FormLabel>
                                                  <FormControl>
                                                       <PasswordInput placeholder='请输入密码' className='col-span-4' {...field} disabled={isSubmitting} />
                                                  </FormControl>
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                                   <FormField
                                        control={form.control}
                                        name='confirmPassword'
                                        render={({ field }) => (
                                             <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                                  <FormLabel className='col-span-2 text-end'>确认密码</FormLabel>
                                                  <FormControl>
                                                       <PasswordInput
                                                            disabled={!isPasswordTouched || isSubmitting}
                                                            placeholder='请再次输入密码'
                                                            className='col-span-4'
                                                            {...field}
                                                       />
                                                  </FormControl>
                                                  <FormMessage className='col-span-4 col-start-3' />
                                             </FormItem>
                                        )}
                                   />
                              </form>
                         </Form>
                    </div>
                    <DialogFooter>
                         <Button type='submit' form='user-form' disabled={isSubmitting}>
                              {isSubmitting ? (
                                   <>
                                        <LoaderCircle className='mr-2 h-4 w-4' />
                                        {isEdit ? '更新中...' : '创建中...'}
                                   </>
                              ) : (
                                   '保存更改'
                              )}
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     )
}
