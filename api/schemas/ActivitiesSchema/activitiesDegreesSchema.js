import zod from 'zod'

const activitiesDegreesSchema = zod.object({
  code: zod.string().min(2, "El código debe tener al menos 2 caracteres").max(10, "El código debe tener como máximo 10 caracteres"),
  name: zod.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre debe tener como máximo 50 caracteres"),
  faculty: zod.string().min(2, "La facultad debe tener al menos 2 caracteres").max(50, "La facultad debe tener como máximo 50 caracteres"),
}).strict()

export const validateDegree = async (data) => {
    return activitiesDegreesSchema.safeParse(data)
}
