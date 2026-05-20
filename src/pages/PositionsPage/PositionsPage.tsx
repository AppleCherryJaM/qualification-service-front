import { ReferencePage } from '../../components/ReferencePage/ReferencePage'
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from '../../hooks/usePositions'
import { PERMISSIONS } from '../../utils/roles'

export function PositionsPage() {
  const { data: positions, isLoading, error } = usePositions()
  const create = useCreatePosition()
  const update = useUpdatePosition()
  const remove = useDeletePosition()

  return (
    <ReferencePage
      title="Должности"
      items={positions}
      isLoading={isLoading}
      error={error}
      columns={[
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Название', width: 250, flex: 1 },
        { field: 'category', headerName: 'Категория', width: 150 },
      ]}
      formFields={[
        { name: 'name', label: 'Название должности', required: true },
        { name: 'category', label: 'Категория (worker/specialist/manager)', required: true },
      ]}
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