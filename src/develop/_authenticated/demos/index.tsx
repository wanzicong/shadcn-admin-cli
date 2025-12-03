import { useQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Main } from '@/develop/(layout)/main.tsx'
import { usersApi } from '@/develop/(services)/api'
import type { User, UserQueryParams } from '@/develop/(services)/api/types'

export const Route = createFileRoute('/_authenticated/demos/')({
     component: RouteComponent,
})

function RouteComponent() {
     const route = getRouteApi('/_authenticated/demos/')
     const navigate = route.useNavigate()
     // 获取查询参数
     // const params = route.useParams()
     const search = route.useSearch()
     // 查询数据
     const { data, isLoading, isError } = useQuery({
          queryKey: ['demos', search],
          queryFn: () => usersApi.getUsers(search as UserQueryParams),
     })

     if (isLoading) {
          return <div>loading ...</div>
     }

     if (isError) {
          return <div>error info </div>
     }

     if (!data) {
          return <div>no data</div>
     }

     const searchChange = async () => {
          await navigate({
               search: {
                    page: 1,
                    page_size: 1,
               },
               params: {
                    sort: 1,
                    page: 2,
               },
          })
     }

     const userData = data.list
     const total = data.total
     const totalPages = data.totalPages

     return (
          <Main>
               <TableDemo data={userData} total={total} totalPages={totalPages} searchParam={search} searchChange={searchChange} />
          </Main>
     )
}

type TableProps = {
     data: User[]
     total: number
     totalPages: number
     searchParam: Record<string, unknown>
     searchChange: () => Promise<void>
}

function TableDemo({ data, total, totalPages, searchParam, searchChange }: TableProps) {
     return (
          <div>
               <div>searchInfo :{JSON.stringify(searchParam)}</div>
               {/*<div>paramsInfo: {JSON.stringify(params)}</div>*/}
               <div>DATA: {JSON.stringify(data)}</div>
               <div>TOTAL: {total}</div>
               <div>TOTAL PAGES: {totalPages}</div>
               <div>
                    {' '}
                    <button onClick={searchChange}> 设置参数 </button>
               </div>
          </div>
     )
}
