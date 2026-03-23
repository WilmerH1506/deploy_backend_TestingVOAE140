import { studentExists, activityExists, registerStudentModel, closeInscriptionsModel, closeActivityModel, getStudentsbyActivityIDModel} from "../../models/activitiesModel/activitiesInscriptions.model.js";
import { calculateAllStudentsVOAE } from "../../utils/activities/horasVOAECalculator.js";
import { successResponse,erroResponse} from '../../utils/responseHandler.js';
export class ActivitiesInscriptionsController {
    static registeStudentinActivity = async (req, res) => {
    
        const {id,activityid} = req.params

       try{

           const student = await studentExists(id);
           const activity = await activityExists(activityid);

           if (student.length === 0) {
               return erroResponse(res, 404, "Estudiante no encontrado");
           }

           if (activity.length === 0) {
               return erroResponse(res, 404, "Actividad no encontrada");
           }

           const response = await registerStudentModel(id,activityid)

           if (response.success === false) {
               return erroResponse(res, 400, response.message);
           }

           successResponse(res, 200, response.message);

       } catch (error) {
           erroResponse(res, 500, 'Hubo un problema al registrar al estudiante', error);
       }
    }

    static getStudentsbyActivityID = async(req,res)=>{
        const {activityid} = req.params;
        try {
           const response = await getStudentsbyActivityIDModel(activityid);
           successResponse(res, 200, 'Lista de estudiantes isncritos',response);
        } catch (error) {
            erroResponse(res, 500, 'Hubo un problema al obtener los estudiantes de esta acitvidad', error);
        }
    }

    static closeInscriptions = async (req,res) => {
        const {id} = req.params;
       
        try{

            const activity = await activityExists(id);

            if (activity.length === 0) {
                return erroResponse(res,404,'Actividad no encontrada')
            }

            await closeInscriptionsModel(id);

            return successResponse(res,200,'Inscripciones cerradas con éxito')

        } catch (error) {
            return erroResponse(res,500, 'Hubo un problema al cerrar las inscripciones')
        }
    }

    static closeActivity = async (req, res) => {

        const {id} = req.params;

        try {

            const activity = await activityExists(id);

            if (activity.length === 0) {
               return erroResponse(res, 404, "Actividad no encontrada");
            }

            await closeActivityModel(id);

            await calculateAllStudentsVOAE(id);

            successResponse(res, 200, 'La actividad ha sido cerrada con éxito');

        }
        catch (error) {
            erroResponse(res, 500, 'Hubo un problema al cerrar la actividad', error);
        }

    }
}