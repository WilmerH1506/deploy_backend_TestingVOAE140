import zod from "zod"

const activitiesFileSchema = zod.object({
    "actividad_id":zod.uuidv4(),
    "nombre_archivo":zod.string(),
}).strict();

export const validateFile= async(data)=>{
    return activitiesFileSchema.safeParse(data);
}