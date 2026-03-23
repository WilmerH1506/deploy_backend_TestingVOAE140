import zod from "zod"

const activitiesSchema = zod.object({
    "title":zod.string(),
    "description":zod.string().min(5).max(500),
    "startDate":zod.coerce.date(),
    "endDate":zod.coerce.date(),
    "voaeHours":zod.number(),
    "availableSpots":zod.number(),
    "supervisorId":zod.uuidv4(),
    "scopes":zod.array(zod.enum(["1","2","3","4"])).min(1),
}).strict();

export const validateActividad = async(data)=>{
    return activitiesSchema.safeParse(data);
}

const externalActivitySchema = zod.object({
  title:          zod.string().min(3),
  description:    zod.string().min(5).max(500),
  startDate:      zod.coerce.date(),
  endDate:        zod.coerce.date(),
  voaeHours:      zod.number().positive(),
  availableSpots: zod.number().int().positive(),
  scopes:         zod.array(zod.enum(["1","2","3","4"])).min(1),
})

export const validateExternalActivity = async (data) => {
  return externalActivitySchema.safeParse(data)
}
 
const activitiesSchemaput = zod.object({
    "actividadId":zod.uuidv4(),
    "title":zod.string(),
    "description":zod.string().min(5).max(500),
    "startDate":zod.coerce.date(),
    "endDate":zod.coerce.date(),
    "voaeHours":zod.number(),
    "availableSpots":zod.number(),
    "supervisorId":zod.uuidv4(),
    "scopes":zod.array(zod.enum(["1","2","3","4"])).min(1),
    "isDisable": zod.number().int(),
}).strict();

export const validateActividadput = async(data)=>{
    return activitiesSchemaput.safeParse(data);
}

const activitiesSchemaForUser = zod.object({
    "title":zod.string(),
    "description":zod.string().min(5).max(500),
    "degreeId":zod.number(),
    "startDate":zod.coerce.date(),
    "endDate":zod.coerce.date(),
    "voaeHours":zod.number(),
    "supervisorId":zod.string().uuid(),
    "scopesId":zod.array(zod.enum(["1","2","3","4"])).min(1),
}).strict();

export const validateActivityForUser = async(data)=>{
    return activitiesSchemaForUser.safeParse(data);
}


const activitiesSchemaDisableEnable = zod.object({
    "actividadId":zod.uuidv4(),
    "isDisableSet": zod.number().int(),
}).strict();


export const validateActividadDisableEneable = async(data)=>{
    return activitiesSchemaDisableEnable.safeParse(data);
}


const activitiesStatus = zod.object({
    "actividadId":zod.uuid(),
    "status": zod.number().int(),
}).strict();


export const validateactivitiesStatus = async(data)=>{
    return activitiesStatus.safeParse(data);
}
