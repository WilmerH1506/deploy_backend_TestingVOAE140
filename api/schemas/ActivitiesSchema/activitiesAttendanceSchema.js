import zod from "zod"
const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const activitiesAttendanceSchema = zod.object({
  studentId: zod.string().uuid("El ID del estudiante debe ser un UUID válido"),
  activityId: zod.string().uuid("El ID de la actividad debe ser un UUID válido"),
  entryTime: zod.string().regex(dateTimeRegex, "entryTime debe ser una fecha en formato ISO"),
  exitTime: zod.string().regex(dateTimeRegex, "exitTime debe ser una fecha en formato ISO"),
  observations: zod.string().max(100).optional()
}).strict();

const activitiesAttendanceArraySchema = zod.object({
  attendances: zod.array(activitiesAttendanceSchema).min(1, { message: "Debe enviarse al menos una asistencia" })
});

export const validateAttendances = async (data) => {
  return activitiesAttendanceArraySchema.safeParse(data);
};

