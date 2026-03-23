import { validateDegree } from "../../schemas/ActivitiesSchema/activitiesDegreesSchema.js";
import { createDegreeModel, getDegreesModel, getTotalDegreesModel, updateDegreeModel, deleteDegreeModel, restoreDegreeModel , degreeExistsModel, hasConflictDegreeModel } from "../../models/activitiesModel/activitiesDegrees.model.js";
import { successResponse, erroResponse } from "../../utils/responseHandler.js";
import { validateOptions } from "../../utils/activities/validateOptionsPaination.js";
import { getTotalStudentsModel } from "../../models/users.model.js";

export class ActivitiesDegreesController {

    static createDegree = async (req, res) => {

        const degree = req.body;

        const { success, error } = await validateDegree(degree);

        if (!success) {
            return erroResponse(res, 400, "Error al validar los datos", error.format());
        }

        try {
            await createDegreeModel(degree);
            return successResponse(res, 201, "Carrera creada con éxito");
        } catch (error) {
            return erroResponse(res, 500, "Hubo un problema al crear la carrera", error);
        }
    }

    static getDegrees = async (req, res) => {

        const {page, limit, search} = req.query
        const {validateLimit, validatePage } = await validateOptions(page,limit)

        const offset = (validatePage - 1) * validateLimit

        const options = {
            validatePage,
            validateLimit,
            offset,
            search
        }

        try {
            const degrees = await getDegreesModel(options);

            if (degrees.length === 0){
                return erroResponse(res, 404, "No se encontraron carreras")
            }

            const countResult = await getTotalDegreesModel(options.search)

            const total = countResult[0].total

            const result = {
                data: degrees,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPage: Math.ceil(total/limit)
                }
            }

            return successResponse(res, 200, "Carreras obtenidas con éxito", result);
        } catch (error) {
            return erroResponse(res, 500, "Hubo un problema al obtener las carreras", error);
        }
    }

    static updateDegree = async (req, res) => {
        const { id } = req.params;
        const degree = req.body;

        const { success, error } = await validateDegree(degree);

        if (!success) {
            return erroResponse(res, 400, "Error al validar los datos", error.format());
        }

        const degreeExist = await degreeExistsModel(id);

        if (degreeExist.length === 0) {
            return erroResponse(res, 404, "Carrera no encontrada");
        }

        try {
            await updateDegreeModel(degree, id);
            return successResponse(res, 200, "Carrera actualizada con éxito");
        } catch (error) {
            return erroResponse(res, 500, "Hubo un problema al actualizar la carrera", error);
        }
    }

    static deleteDegree = async (req, res) => {
        const { id } = req.params;

        const degreeExist = await degreeExistsModel(id);
        const hasConflict = await hasConflictDegreeModel(id);

        if (degreeExist.length === 0) {
            return erroResponse(res, 404, "Carrera no encontrada");
        }

        if (hasConflict.length > 0) {
            return erroResponse(res, 409, "La carrera no se puede eliminar porque está vinculada a una actividad");
        }

        try {
            await deleteDegreeModel(id);
            return successResponse(res, 200, "Carrera deshabilitada con éxito");
        } catch (error) {
            return erroResponse(res, 500, "Hubo un problema al deshabilitar la carrera", error);
        }
    }


    static restoreDegree = async (req,res) => {
        const {id} = req.params 

        const degreeExist = await degreeExistsModel(id);

        if (degreeExist.length === 0) {
            return erroResponse(res, 404, "Carrera no encontrada");
        }

        try {
            await restoreDegreeModel(id);
            return successResponse(res, 200, "Carrera restaurada con éxito");
        } catch (error) {
            return erroResponse(res, 500, "Hubo un problema al restaurar la carrera", error);
        }        
    }
}