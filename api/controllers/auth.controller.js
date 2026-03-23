import {v4 as uuidv4} from "uuid"
import { RegisterUserBD,GetUserByEmailDB, VerifyPasswordDB,ChangePassDb,userExist, AdminChangeDb, UpdateDataDB,DeleteUserDB } from "../models/auth.model.js"
import { FilterData,LoginData,UpdateP,UpdateD, IDv} from "../schemas/Auth.Schema.js"
import bcrypt from "bcrypt"
import {Resend} from "resend"
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken' 
import { validateResult,validateUserDb } from "../utils/validations.js"
import { erroResponse, successResponse } from "../utils/responseHandler.js"

export default class AuthController {

    static  RegisterUser = async (req,res)=>{
        const {name,email,password,accountNumber,identityNumber,role,degreeId} = req.body
        const data={name,email,password,accountNumber,identityNumber,role,degreeId}
        
        try{

            const filter = await FilterData(data)
            
           if(validateResult(filter,res)) return
        const id = uuidv4()
        
        
        const hash_password = await bcrypt.hash(password, 10)
                   
            const resultado = await RegisterUserBD([id,name,email,hash_password,accountNumber,identityNumber,role,degreeId])
            
            if(resultado){
                return successResponse(res,201,"Registro con éxito",resultado)
            }
        }catch(error){
            return erroResponse(res,500,"Error al registrar usuario",error)
                     
            
        }

    }

   
static LoginUser = async (req, res) => {
    const { email, password } = req.body;
    const data = { email, password };

    try {
        
        const filter = await LoginData(data);
        if(validateResult(filter,res)) return

        
        const user = await GetUserByEmailDB(email); 
        
        
        if(validateUserDb(user,res)) return

        
        const match = await bcrypt.compare(password, user.password);
        
        
        if (!match) {
            return erroResponse(res,401,"Contraseña o correo incorrecto ")

        }

        
        const payload = {
            email: user.email,
            role: user.role,
            id : user.id
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });
        delete user.password
        return successResponse(res,200,"Inicio de seccion exitoso",{user,token})
        

    } catch (error) {
       return  erroResponse(res,500,"Error en el login",error)
        
    }
}

static checkStatusUser = async (req, res) => {
    const {authorization} = req.headers;
 
    try{
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const {email} = decoded;

        const user = await GetUserByEmailDB(email); 
        
        const payload = {
            email: user.email,
            role: user.role,
            id : user.id
        };

        const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        delete user.password
        return successResponse(res,200,"Token chekeado",{user,newToken})

    }catch(error){
         return  erroResponse(res,500,"Hubo un error al obtener el nuevo",error)
    }
    

    
    
}


static UpdatePassword = async (req,res)=>{

    const {authorization} = req.headers
    const{password , NewPassword } = req.body
    const {id} = req.params
    const data={password,NewPassword}

    try{


        const exist = await userExist(id)
        const filter = await UpdateP(data)

        if(validateUserDb(exist,res)) return        
        if(validateResult(filter,res)) return

        const token = authorization.split(' ')[1]
       
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        
        const hash_password_New = await bcrypt.hash(NewPassword,10)
            
        const Pass = await VerifyPasswordDB(decoded.email,decoded.id)


        if(!Pass || Pass.length===0){
            return erroResponse(res,404,"Contraseña no concuerda")
             
        }
        
        const match = await bcrypt.compare(password, Pass[0].password);
        
        if (!match) {
            return erroResponse(res,401,"Contraseña no coincide ")
           
        }
        
        const resultado = await ChangePassDb(hash_password_New,decoded.id)
        
        if(resultado){
            return successResponse(res,201,"Contraseña Actualizada con éxito ",resultado)
            }

    }catch(error){
        return erroResponse(res,500,"Error al cambiar contraseña",error)
        }   
}

static UpdateData = async (req,res)=>{
    const {id:ID,name,email,degreeId} = req.body
    const {id} =  req.params
    const data={ID,name,email,degreeId}

    try{

        const filter = await UpdateD(data)
         if(validateResult(filter,res)) return
        
        if(name === undefined){name=Exist[0].name}
        if(email === undefined){email=Exist[0].email}
        if(degreeId===undefined){degreeId=Exist[0].degreeId}

       
        const Update = await UpdateDataDB(name,email,degreeId,id)
       
        if(Update){
            return successResponse(res,201,"Actualizacion de Datos con Exito  ",Update)
            }

    }catch(error){
        return erroResponse(res,500,"Error Al Actualizar Datos",error)
       }
}

static DeleteUser=async (req,res)=>{

    const {id}=req.params
    const data={id}
   try{
     const filter  = await IDv(data)

     if(validateResult(filter,res)) return
    
    const Exist = await userExist(id)
        
    if(validateUserDb(Exist,res)) return
        
    const result = await DeleteUserDB(id)   
    

    if(result){
        return successResponse(res,201,"Actualizacion de Datos con Exito  ",result)
            }

   }catch(error){
    return erroResponse(res,500,"Error Al Eliminar Usuario",error)
   }
}

}