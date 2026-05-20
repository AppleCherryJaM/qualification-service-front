import { ReferencePage } from '../../components/ReferencePage/ReferencePage'
import { useTrainingTypes, useCreateTrainingType, useUpdateTrainingType, useDeleteTrainingType } from '../../hooks/useTrainingTypes'
import { PERMISSIONS } from '../../utils/roles'

export function TrainingTypesPage() {
  const { data: types, isLoading, error } = useTrainingTypes()
  const create = useCreateTrainingType()
  const update = useUpdateTrainingType()
  const remove = useDeleteTrainingType()

  return (
    <ReferencePage
      title="Виды обучения"
      items={types}
      isLoading={isLoading}
      error={error}
      columns={[
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Название', width: 300, flex: 1 },
      ]}
      formFields={[{ name: 'name', label: 'Название вида обучения', required: true }]}
      onCreate={(data) => create.mutate(data)}
      onUpdate={(id, data) => update.mutate({ id, data })}
      onDelete={(id) => remove.mutate(id)}
      createPending={create.isPending}
      updatePending={update.isPending}
      deletePending={remove.isPending}
      allowedRoles={PERMISSIONS.COURSES_CREATE}
    />
  )
}