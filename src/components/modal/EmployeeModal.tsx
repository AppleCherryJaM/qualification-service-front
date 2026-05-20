import { Employee } from "@/types/api";
import { 
    Button, 
    CircularProgress, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    FormControl, 
    InputLabel, 
    MenuItem, 
    Select, 
    TextField 
} from "@mui/material";
import { useState } from "react";

interface EmployeeFormData {
  tabNumber: string
  fullName: string
  hireDate: string
  departmentId: number
  positionId: number
}

export function EmployeeFormModal({
  open, onClose, initialData, departments, positions, onSubmit, isPending,
}: {
  open: boolean; onClose: () => void; initialData?: Employee;
  departments?: { id: number; name: string }[];
  positions?: { id: number; name: string }[];
  onSubmit: (data: EmployeeFormData) => void; isPending: boolean;
}) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    tabNumber: initialData?.tabNumber || '',
    fullName: initialData?.fullName || '',
    hireDate: initialData?.hireDate
      ? new Date(initialData.hireDate).toISOString().split('T')[0]
      : '',
    departmentId: initialData?.departmentId || 0,
    positionId: initialData?.positionId || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Табельный номер"
            value={formData.tabNumber}
            onChange={(e) => setFormData({ ...formData, tabNumber: e.target.value })}
            required fullWidth
          />
          <TextField
            label="ФИО"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required fullWidth
          />
          <TextField
            label="Дата приёма"
            type="date"
            value={formData.hireDate}
            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            required fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth required>
            <InputLabel>Подразделение</InputLabel>
            <Select
              value={formData.departmentId}
              label="Подразделение"
              onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
            >
              {departments?.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Должность</InputLabel>
            <Select
              value={formData.positionId}
              label="Должность"
              onChange={(e) => setFormData({ ...formData, positionId: Number(e.target.value) })}
            >
              {positions?.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}