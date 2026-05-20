import { ReferencePage } from '../../components/ReferencePage/ReferencePage'
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../hooks/useDepartments'
import { PERMISSIONS } from '../../utils/roles'

export function DepartmentsPage() {
  const { data: departments, isLoading, error } = useDepartments()
  const create = useCreateDepartment()
  const update = useUpdateDepartment()
  const remove = useDeleteDepartment()

  return (
    <ReferencePage
      title="Подразделения"
      items={departments}
      isLoading={isLoading}
      error={error}
      columns={[
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Название', width: 300, flex: 1 },
      ]}
      formFields={[{ name: 'name', label: 'Название отдела', required: true }]}
      onCreate={(data) => create.mutate(data)}
      onUpdate={(id, data) => update.mutate({ id, data })}
      onDelete={(id) => remove.mutate(id)}
      createPending={create.isPending}
      updatePending={update.isPending}
      deletePending={remove.isPending}
      allowedRoles={PERMISSIONS.EMPLOYEES_CREATE}
    />
  )
}