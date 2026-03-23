import { IDv, NumbersV } from "../schemas/Auth.Schema.js"
import { userExist } from "../models/auth.model.js"
import { CurrentActivitiesDB, VOAEHours, getStudentsModel,getTotalStudentsModel,getSupervisorsModel,getTotalSupervisorsModel,disableSupervisorModel,enableSupervisorModel,getCareersModel,registerActivityForStudentModel } from "../models/users.model.js"
import { validateActivityForUser } from "../schemas/ActivitiesSchema/activitiesSchema.js"
import { validateOptions } from "../utils/activities/validateOptionsPaination.js"
import { validateResult, validateUserDb } from "../utils/validations.js"
import { successResponse,erroResponse } from "../utils/responseHandler.js"


export default class UserController{

    static GetUserActivity = async (req,res)=>{
        const id = Object.values(req.params)[0];
        const data=id
       try{

       
         const filter  = await NumbersV(data)
        if(validateResult(filter,res)) return
        
       
        
        const Exist = await userExist(id)
       

        if(validateUserDb(Exist,res))return
          
        const result = await CurrentActivitiesDB(id)
        
        if(result.length===0){
            return successResponse(res,200,"No ha realizado actividades previamente") 
        }
        
        if(result){
          return  successResponse(res,201,"Actividades",result)
        }

       }catch(error){
        return erroResponse(res,500,"Error al visualizar actividades",error)
       }


    }

    static ActivitiesScope = async (req , res)=>{

       const id = Object.values(req.params)[0];
        const data=id

      try {

        const filter  = await NumbersV(data)

        if(validateResult(filter,res)) return

        const Exist = await userExist(id)
        if(validateUserDb(Exist,res))return
                
                
        const result  = await VOAEHours(id)
        
        if(result.length===0){
             return successResponse(res,200,"No ha Adquirido Horas VOAE", [{
                studentName: result.studentName || 'Estudiante',
                culturalHours: 0,
                deportivoHours: 0,
                cientificoAcademicoHours: 0,
                socialHours: 0,
                totalHours: 0
             }])
        }
        
        if(result){
            return successResponse(res,200,"Horas VOAE Adquiridas:",result)
        }
        
      } catch (error) {
        return erroResponse(res,500,"Error al visualizar Horas VOAE",error)
      }


    }

    static getStudents =  async (req,res) => {

      const {page,limit, search } = req.query
      const {validateLimit,validatePage} = await validateOptions(page,limit)

      const offset = (validatePage - 1) * validateLimit;

      const options = {
          validatePage,
          validateLimit,
          offset,
          search
        }

      try{

        const students = await getStudentsModel(options)

        if (students.length === 0){
            return erroResponse (res,404,"No hay estudiantes registrados")
        }

        const countResult = await getTotalStudentsModel(options.search)

        const total = countResult[0].total

        const result = {
          data: students,
          pagination: {
            total,
            page,
            limit,
            totalPage:Math.ceil(total/limit),
          }
        }

        return successResponse(res,200,"Estudiantes:",result)


      }catch (error){
        return erroResponse(res,500,"Error al obtener estudiantes",error)
      }
    }

    static getSupervisors =  async (req,res) => {

      const {page,limit, search} = req.query
      const {validateLimit,validatePage} = await validateOptions(page,limit)

      const offset = (validatePage - 1) * validateLimit;

      const options = {
          validatePage,
          validateLimit,
          offset,
          search
      }

      try{

        const supervisors = await getSupervisorsModel(options)

        if (supervisors.length === 0){
            return erroResponse (res,404,"No hay supervisores registrados")
        }

        const countResult = await getTotalSupervisorsModel(options.search)

        const total = countResult[0].total

        const result = {
          data: supervisors,
          pagination: {
            total,
            page,
            limit,
            totalPage:Math.ceil(total/limit),
          }
        }

        return successResponse(res,200,"Supervisores:",result)


      }catch (error){
        return erroResponse(res,500,"Error al obtener supervisores",error)
      }
    }

    static disableSupervisor = async (req,res) => {

      const {accountNumber} = req.params

     try {

       const result = await disableSupervisorModel(accountNumber)

       if (result.affectedRows === 0) {
         return erroResponse(res,404,"Supervisor no encontrado")
       }

       return successResponse(res,200,"Supervisor actualizado con éxito")

     } catch (error) {
       return erroResponse(res,500,"Error al actualizar supervisor",error)
     }
   }

   static enableSupervisor = async (req,res) => {

      const {accountNumber} = req.params

     try {

       const result = await enableSupervisorModel(accountNumber)

       if (result.affectedRows === 0) {
         return erroResponse(res,404,"Supervisor no encontrado")
       }

       return successResponse(res,200,"Supervisor actualizado con éxito")

     } catch (error) {
       return erroResponse(res,500,"Error al actualizar supervisor",error)
     }
   }

     static getCareers =  async (req,res) => {

      try{

        const careers = await getCareersModel()

        if (careers.length === 0){
            return erroResponse (res,404,"No hay carreras registradas")
        }

        return successResponse(res,200,"Carreras:",careers)

      }catch (error){
        return erroResponse(res,500,"Error al obtener carreras",error)
      }
    }

    static registerActivityForStudent = async (req, res) => {
      const { id, activityId } = req.params

      try {
        const Exist = await userExist(id)
        if (validateUserDb(Exist, res)) return

        const response = await registerActivityForStudentModel(activityId, id)

        if (response.isDuplicate) {
          return res.status(409).json({
            success: false,
            isDuplicate: true,
            message: response.message
          })
        }

        return res.status(201).json({
          success: true,
          message: "Actividad registrada con éxito",
          data: response
        })

      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Error al registrar actividad"
        })
      }
    }
}


