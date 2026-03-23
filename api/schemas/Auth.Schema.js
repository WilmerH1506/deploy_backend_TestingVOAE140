import zod from "zod"
import { da } from "zod/locales";

const RegisterUserSchema = zod.object({
  name: zod
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre no debe contener caracteres especiales ni números'),

  email: zod
    .string()
    .email('Debe ser un correo válido'), 

  password: zod
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(24, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),

  accountNumber: zod
    .number()
    .int('Debe ser un número entero')
    .gte(10000000000, 'Debe tener exactamente 11 dígitos')
    .lte(99999999999, 'Debe tener exactamente 11 dígitos'),

  identityNumber: zod
    .string()
    .regex(/^\d{13,15}$/, 'Debe contener entre 13 y 15 dígitos numéricos'),

   role: zod
   .enum(["admin", "student", "supervisor"]),

  degreeId: zod
  .number().min(1)
}).strict();



export const FilterData = async(data)=>{
    return RegisterUserSchema.safeParse(data);
}

const LoginUserSchema = zod.object({
  email: zod
    .string()
    .email('Debe ser un correo válido'),

  password: zod
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(24, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
}).strict()

export const LoginData= async(data)=>{ 
  return LoginUserSchema.safeParse(data)}

const PasswordUpdateSchema = zod.object({
  

  password : zod
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(24, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
    
    NewPassword: zod
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(24, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial')
}).strict()

export const UpdateP = async  (data) =>{
  return PasswordUpdateSchema.safeParse(data)
}

const UpdateDataSchema = zod.object({

  name: zod
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre no debe contener caracteres especiales ni números')
    .optional(),
    
    email: zod
    .string()
    .email('Debe ser un correo válido').optional(),

    degreeId: zod
    .number()
    .min(1, 'Debe ser mayor o igual a 1').optional(),

    id: zod
    .uuidv4().optional()


})

export const UpdateD = async (data)=>{
  return UpdateDataSchema.safeParse(data)
}

const ValidID = zod.object({
  id: zod
  
  .uuidv4()
}).strict()

export const IDv = async  (id)=>{
  return ValidID.safeParse(id)
}


const ValidNumber= zod.union([
  zod.preprocess((val) => {
    if (typeof val === "string" && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, zod.number()
    .int()
    .gte(10000000000)
    .lte(99999999999)),

  
zod.string().regex(/^\d{13}$|^\d{15}$/, "Debe contener exactamente 13 o 15 dígitos numéricos"),

  zod.string().uuid("Debe ser un UUID válido"),

]);

export const NumbersV = async(N)=>{
  return ValidNumber.safeParse(N)
}