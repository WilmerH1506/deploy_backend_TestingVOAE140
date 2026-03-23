import { getActividadbyIdModel, getActividadModel,getDefaultAdminModel,getActivitiesForSupervisorModel, confirmSupervisor, ValidateCreateActivitiesModel, ValitateUpdateActivitiesModel, ValidateDeleteActivitiesModel, ValitateActivitiesDisableEnableModel, TotalActividadModel, updatestatusActivity } from "../../models/activitiesModel/activities.model.js";
import { validateActividad,validateExternalActivity, validateActividadDisableEneable, validateActividadput, validateactivitiesStatus } from "../../schemas/ActivitiesSchema/activitiesSchema.js";
import { v4 as uuidv4 } from "uuid";
import { successResponse, erroResponse } from "../../utils/responseHandler.js";
import {formatDateHonduras} from "../../utils/activities/formatDateHonduras.js";
import { validateOptions } from "../../utils/activities/validateOptionsPaination.js";

export class ActivitiesController {
    static getActivityController =async(req,res)=>{
            const {page,limit, search} = req.query;
            const {validatePage,validateLimit} = validateOptions(page,limit)

            const offset = (validatePage - 1) * validateLimit;
            const options = {
                validatePage,
                validateLimit,
                offset,
                search
            }
         try {
            const actividades = await getActividadModel(options);  

            if (actividades.length === 0) {
                return erroResponse(res, 404, 'No se encontraron actividades');
            }

            const formatedActivities = actividades.map(actividad => ({
                ...actividad,
                startDate: formatDateHonduras(actividad.startDate),
                endDate: formatDateHonduras(actividad.endDate),
            }));

            const countResult = await TotalActividadModel(options.search);
        
            const total = countResult[0].total;

            const result = {
                data:formatedActivities,
                pagination:{
                    total,
                    page,
                    limit,
                    totalPage:Math.ceil(total/limit),
                },
            };

            return successResponse(res, 200, "La activiades se obtuvieron con exito" ,result);

        } catch (error) {
            return erroResponse(res, 500, 'Error al obtener las actividades', error);
        }
    }

    static getDeletedActivitiesController = async(req,res) => {

        const {page,limit} = req.query;
        const {validatePage,validateLimit} = validateOptions(page,limit)

        const offset = (validatePage - 1) * validateLimit;

         const options = {
            validatePage,
            validateLimit,
            offset
        };

        try {
           const deletedActivities = await ValidateDeleteActivitiesModel.getDeletedActivitiesModel(options);

           if (deletedActivities.length === 0) {
               return erroResponse(res, 404, 'No se encontraron actividades eliminadas');
           }

              const formatedDeletedActivities = deletedActivities.map(actividad => ({
                  ...actividad,
                  startDate: formatDateHonduras(actividad.startDate),
                  endDate: formatDateHonduras(actividad.endDate),
              }));

              const countResult = await ValidateDeleteActivitiesModel.totalDeletedActivitiesModel();
              const total = countResult[0].total;

              const result = {
                data: formatedDeletedActivities,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPage: Math.ceil(total / limit),
                },
            };

              return successResponse(res, 200, "Actividades eliminadas:",result);

        } catch (error) {
            return erroResponse(res, 500, 'Error al obtener las actividades eliminadas', error);
        }
    }

    static getActivityByIdController = async(req,res)=>{

        const {id} = req.params;
        try {
            const actividad =  await getActividadbyIdModel(id);

            if (actividad.length === 0) {
                return erroResponse(res, 404, 'Actividad no encontrada');
            }

            const formatedActivity = actividad.map(act => ({
                ...act,
                startDate: formatDateHonduras(act.startDate),
                endDate: formatDateHonduras(act.endDate),
            }));

            return successResponse(res, 200, formatedActivity);
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al obtener la actividad', error);
        }
    }

    static getActivitiesForSupervisorId = async (req,res) => {

        const {id} = req.params;

        try {

            const isValidSupervisor = await confirmSupervisor(id);

            if (isValidSupervisor.length === 0) {
                return erroResponse(res, 403, 'El usuario no es un supervisor o no existe');
            }

            const activities = await getActivitiesForSupervisorModel(id)

            if (activities.length === 0) {
                return erroResponse(res, 404, 'No se encontraron actividades para este supervisor');
            }

            const formatedActivities = activities.map(actividad => ({
                ...actividad,
                startDate: formatDateHonduras(actividad.startDate),
                endDate: formatDateHonduras(actividad.endDate),
            }));

            return successResponse(res, 200, "Actividades: ", formatedActivities);
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al obtener las actividades del supervisor', error);
        }
    }

    static createActivityController =async(req,res)=>{

        const activityReceived = req.body;
        const {success,error,data} =await validateActividad(activityReceived);

        if(!success){
            return erroResponse(res, 400, 'Error al validar la data', error);
        }

        data.id = uuidv4()
        data.degreeId = 1

        try {
            const response = await ValidateCreateActivitiesModel.validateActivitiesModel(data);

            if(response){
                return erroResponse(res, 404, 'No se puede crear una actividad en este dia ya que ya existe otra actividad en el mismo horario');
            }
            await ValidateCreateActivitiesModel.crearActividadModel(data);
            return successResponse(res, 201, 'Actividad creada con exito');
        } catch (error) {
            return erroResponse(res, 400, 'hubo un error al crear la data', error);
        }
    }

    static createExternalActivityController = async (req, res) => {
        const { success, error, data } = await validateExternalActivity(req.body)

        if (!success) {
          
            return erroResponse(res, 400, 'Error al validar la data', error)
        }

        try {
            const adminResult = await getDefaultAdminModel()

            if (!adminResult || adminResult.length === 0) {
            return erroResponse(res, 500, 'No se encontró un administrador por defecto')
            }

            data.id          = uuidv4()
            data.degreeId    = 1
            data.supervisorId = adminResult[0].id

            await ValidateCreateActivitiesModel.createExternalActivityModel(data)
            return successResponse(res, 201, 'Actividad externa creada con éxito')
        } catch (error) {
            return erroResponse(res, 500, 'Error al crear la actividad externa', error)
        }
    }

    static putActivityByIdController = async(req,res)=>{
        const {id} = req.params;
        const data = req.body;
        data.actividadId=id;
        const {success,error,data:safedata}=await validateActividadput(data);

        if(!success){
            return erroResponse(res, 400, 'Error al validar la data', error);
        }

        try {
            const result = await ValitateUpdateActivitiesModel.validateActivitiesDelete(id);

                if(result==='true'){
                    return erroResponse(res, 400, 'No se puede actualizar una actividad eliminada');
                }

            const response = await ValitateUpdateActivitiesModel.putActividadbyidModel(safedata);
            return successResponse(res, 200, 'La actividad ha sido actualizada con exito', response);   
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al actualizar la actividad', error);
        }
    }   

    static putActivityDisableEneable = async(req,res)=>{
        const {id} = req.params;
        const data = req.body;
        data.actividadId=id;
        const {success,error,data:safedata}=await validateActividadDisableEneable(data);

        if(!success){
            return erroResponse(res, 400, 'Error al validar la data', error);
        }

        const {isDisableSet}=safedata;
        try {
            const result = await ValitateActivitiesDisableEnableModel.validateActivitiesDelete(id);

                if(result==='true'){
                    return erroResponse(res, 400, 'No se puede actualizar una actividad eliminada');
                }
            if(isDisableSet===1){
                const response = await ValitateActivitiesDisableEnableModel.putActividadDisableModel(safedata);
                return successResponse(res, 200, 'La actividad fue deshabilitada', response); 
            }else{
                const response = await ValitateActivitiesDisableEnableModel.putActividadEnableModel(safedata);
                return successResponse(res, 200, 'La actividad fue habilitada', response); 
            }
              
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al actualizar la actividad', error);
        }
    }   

     static getActivityDisableEneable = async(req,res)=>{
        const {id} = req.params;
        
        try {
            const response = await ValitateActivitiesDisableEnableModel.getActiviyenableDisable(id);
            return successResponse(res, 200, 'La actividad esta', response); 
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al actualizar la actividad', error);
        }
    }   


    static deleteActivityByIdController =async(req,res)=>{
        const {id}= req.params;
        try {
            const {inscripcion,status,isDeleted} = await ValidateDeleteActivitiesModel.validateActivitiesModel(id);

            if(inscripcion){
                return erroResponse(res, 400, 'La actividad no se puede eliminar por que tiene estudiantes inscritos');
            }

            if(isDeleted==='true'){
                return erroResponse(res, 400, 'La actividad ya esta eliminada');
            }
            
            if(!status){
                return erroResponse(res, 400, 'Actividad no encontrada');
            }

            if(status==='inProgress'){
                return erroResponse(res, 400, 'Actividad en proceso no puede ser eliminada');
            }else if(status==='finished'){
                return erroResponse(res, 400, 'Actividad finalizada no puede ser eliminada');
            }
            
            await ValidateDeleteActivitiesModel.deleteActivitiesModel(id);
            return successResponse(res, 200, 'Actividad eliminada exitosamente');
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al eliminar la actividad', error);
        }
    }

    static restoreDeletedActivityController = async (req,res) => {
        const {id} = req.params;

        const options = {
            offset: 0,
            validateLimit: 1000,
        }

        try {
            const activity = await ValidateDeleteActivitiesModel.getDeletedActivitiesModel(options);

            const activityToRestore = activity.find(act => act.id === id);

            if (!activityToRestore) {
                return erroResponse(res, 404, 'Actividad a restaurar no encontrada');
            }

            await ValidateDeleteActivitiesModel.restoreActivitiesModel(id);
            return successResponse(res, 200, 'Actividad restaurada exitosamente');
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al restaurar la actividad', error);
        }
    }

    static handleStatusActivitiesManual = async (req,res)=>{
        const { status } = req.query;
        const { id } = req.params;

        const data = {
            actividadId: id,
            status: Number(status),
        };

        const { success, error, data: safedata } = await validateactivitiesStatus(data);
        
        if(!success){
            return erroResponse(res, 400, 'Error al validar la data', error);
        }

        try {
            await updatestatusActivity(safedata);
            return successResponse(res, 200, 'Estado acturalizado exitosamente');
        } catch (error) {
            return erroResponse(res, 500, 'Hubo un problema al actualizar el estado', error);
        }
    }
}