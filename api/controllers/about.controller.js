import { successResponse, erroResponse } from "../utils/responseHandler.js";
import { getSectionsModel, getPostByIdModel, getAdminPostsModel, updateSectionModel, 
         getPostsModel, createPostModel, deletePostModel, updatePostModel, 
         togglePostVisibilityModel, togglePostPinModel, incrementPostViewsModel  } from "../models/about.model.js";

export class AboutController {

    static getSectionsController = async (req, res) => {

        try { 

            const result = await getSectionsModel()
            return successResponse(res, 200, "El estado de las secciones son:", result);

        }
        catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }

    static updateSectionsController = async (req, res) => {

        const {carousel,mision_vision,competencies, goals} = req.body

        try {

            if (carousel === undefined || mision_vision === undefined 
                || competencies === undefined || goals === undefined) 
                {
                return erroResponse(res, 400, "Todos los campos son requeridos");
            }

            await updateSectionModel({carousel,mision_vision,competencies, goals})
            return successResponse(res, 200, "Secciones actualizadas con éxito");

        } 
        catch (error) {
            return erroResponse(res, 500, error.message);
        }

    }

    static getPostsController = async (req, res) => {

        const {category} = req.query
        const validCategories = ["General", "VOAE", "Academico","Convocatoria"]

        if (category && !validCategories.includes(category)) {
            return erroResponse(res, 400, `La categoría debe ser una de las siguientes: ${validCategories.join(", ")}`);
        }

        try {

         const result = await getPostsModel(category)
         return successResponse(res, 200, "Los posts son:", result);
            
        } catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }

    static getAdminPostsController = async (req, res) => {

        try {

            const result = await getAdminPostsModel()
            return successResponse(res, 200, "Los posts son:", result);

        } catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }

    static createPostController = async (req, res) => {

        const {title,content,image_url = null,category,
               is_pinned,is_visible,event_date = null ,event_place = null } = req.body

        const validCategories = ["General", "VOAE", "Academico","Convocatoria"]

        try {

            if (!title?.trim() || !content?.trim() || !category) {
                return erroResponse(res, 400, "Los campos title, content y category son requeridos");
            }

            if (!validCategories.includes(category)) {
                return erroResponse(res, 400, `La categoría debe ser una de las siguientes: ${validCategories.join(", ")}`);
            }

            // Formatear la fecha si se proporciona
            let formattedDate = null

            if (event_date) {
                const date = new Date(event_date)
                if (isNaN(date.getTime())) {
                    return erroResponse(res, 400, "La fecha del evento no es válida");
                }
                formattedDate = date.toISOString().slice(0, 19).replace('T', ' ')
            }

            await createPostModel({title,content,image_url,category,is_pinned,is_visible,event_date: formattedDate,event_place})
            return successResponse(res, 201, "Post creado con éxito");


    } catch (error) {
        return erroResponse(res, 500, error.message);
    }
  }

  static updatePostController = async (req, res) => {

    const {id} = req.params
    const {title,content,image_url = null,category,
          is_pinned, is_visible, event_date = null ,event_place = null } = req.body

    const validCategories = ["General", "VOAE", "Academico","Convocatoria"]

        if (!title?.trim() || !content?.trim() || !category) {
            return erroResponse(res, 400, "Los campos title, content y category son requeridos");
            }

        if (!validCategories.includes(category)) {
            return erroResponse(res, 400, `La categoría debe ser una de las siguientes: ${validCategories.join(", ")}`);
        }

        try {

            const existing = await getPostByIdModel(id)

            if (!existing || existing.length === 0) {
                return erroResponse(res, 404, "Post no encontrado")
            }

            // Formatear la fecha si se proporciona
            let formattedDate = null

            if (event_date) {
                const date = new Date(event_date)
                if (isNaN(date.getTime())) {
                    return erroResponse(res, 400, "La fecha del evento no es válida");
                }
                formattedDate = date.toISOString().slice(0, 19).replace('T', ' ')
            }


            await updatePostModel(id, {title,content,image_url,category,is_pinned,is_visible,event_date: formattedDate,event_place})
            return successResponse(res, 200, "Post actualizado con éxito");

        } catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }

    static deletePostController = async (req, res) => {

        const {id} = req.params

        try {

            const existing = await getPostByIdModel(id)

            if (!existing || existing.length === 0) {
                return erroResponse(res, 404, "Post no encontrado")
            }

            await deletePostModel(id)
            return successResponse(res, 200, "Post eliminado con éxito");

        } catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }

    static togglePostVisibilityController = async (req, res) => {

        const {id} = req.params

        try {

            const existing = await getPostByIdModel(id)
            if (!existing || existing.length === 0) {
                return erroResponse(res, 404, "Post no encontrado")
            }

            await togglePostVisibilityModel(id, existing.is_visible === 0 ? 1 : 0)
            return successResponse(res, 200, "Visibilidad del post actualizada con éxito");
        } catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }

    static togglePostPinController = async (req, res) => {
        const {id} = req.params

        try {
            const existing = await getPostByIdModel(id)
            if (!existing || existing.length === 0) {
                return erroResponse(res, 404, "Post no encontrado")
            }

            await togglePostPinModel(id, existing.is_pinned === 0 ? 1 : 0)
            return successResponse(res, 200, "Estado de pin del post actualizado con éxito");
        } catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }

    static incrementPostViewsController = async (req, res) => {

        const {postid} = req.params
        const {viewer_key} = req.body

        try {

            const existing = await getPostByIdModel(postid)
            if (!existing || existing.length === 0) {
                return erroResponse(res, 404, "Post no encontrado")
            }

            await incrementPostViewsModel(postid, viewer_key)
            return successResponse(res, 200, "Visitas del post incrementadas con éxito");
        }
        catch (error) {
            return erroResponse(res, 500, error.message);
        }
    }
}