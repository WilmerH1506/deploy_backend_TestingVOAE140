import zod from "zod";
const hoursAwardedUpdateSchema = zod.object({
  hoursAwarded: zod
    .number({
      required_error: "Las horas obtenidas son requeridas",
      invalid_type_error: "Las horas deben ser un número"
    })
    .int("Las horas deben ser un número entero")
    .min(0, "Las horas no pueden ser negativas")
    .max(200, "Las horas no pueden exceder 200")
    .nullable()
}).strict(); 

export const validateHoursAwarded = (data) => {
  return hoursAwardedUpdateSchema.safeParse(data);
};

export const attendanceIdSchema = zod.object({
  attendanceId: zod
    .string({
      required_error: "El ID de asistencia es requerido"
    })
    .uuid("El ID debe ser un UUID válido")
}).strict();

export const validateAttendanceId = (params) => {
  return attendanceIdSchema.safeParse(params);
}  
