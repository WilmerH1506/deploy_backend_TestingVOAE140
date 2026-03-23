import { successResponse, erroResponse } from "../../utils/responseHandler.js";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from 'uuid'
import { getActivitiesFilesModel, postActivitiesFilesModel } from "../../models/activitiesModel/activitiesFile.model.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class ActivitiesFilesController {
    static getFilesController = async (req, res) => {
        try {
            const allImages = await cloudinary.api.resources({
                resource_type: 'image',
                type: 'upload',
            });

            const filteredImages = allImages.resources.filter(
                image => image.asset_folder === 'ARTICULO140IMAGES'
            );

            return successResponse(res, 200, "Las imágenes son:", filteredImages);
        } catch (error) {
            return erroResponse(res, error.message);
        }
    }

    static postFilesController = async (req, res) => {

        try {

            const file = req.file;
            if (!file) {
                return erroResponse(res, 400, 'No se ha proporcionado ningún archivo');
            }
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'ARTICULO140IMAGES',
            });

            return successResponse(res, 201, 'Archivo subido con éxito', result);

        } catch (error) {
            return erroResponse(res, error.message);
        }
    }

    static linkImageToActivityController = async (req, res) => {
        const { activityId, imagePublicId, imageUrl, imageName } = req.body

        try {
            if (!imagePublicId) {
                return erroResponse(res, 400, 'imagePublicId es requerido')
            }

            let cloudinaryResource = null

            try {
                cloudinaryResource = await cloudinary.api.resource(imagePublicId, {
                    resource_type: 'image',
                });

                if (!cloudinaryResource?.asset_folder ||
                    cloudinaryResource.asset_folder !== 'ARTICULO140IMAGES'
                ) {
                    return erroResponse(
                        res,
                        400,
                        'La imagen no pertenece a la carpeta ARTICULO140IMAGES'
                    )
                }

            } catch (error) {
                return erroResponse(res, 400, 'no se pudo validar en Cloudinary', error);
            }

            const filePayload = {
                id: uuidv4(),
                activityId,
                fileName: `${imageName || imagePublicId}|${imagePublicId}`,
                url: imageUrl || null,
            }

            await postActivitiesFilesModel(filePayload)

            return successResponse(
                res,
                201,
                'Imagen vinculada a la actividad correctamente',
                filePayload
            )

        } catch (error) {
            return erroResponse(res, error.message);
        }
    }

    static getImageByActivityController = async (req, res) => {
    const { id } = req.params

    try {
      const file = await getActivitiesFilesModel(id)

      if (!file) {
        return erroResponse(res, 404, 'No se encontró imagen vinculada para esta actividad')
      }

      return successResponse(res, 200, 'Imagen de la actividad', file)
    } catch (error) {
      return erroResponse(res, error.message)
    }
    }

    static updateImageActivityController = async (req, res) => {
        const { id } = req.params   
        const {imagePublicId, imageUrl, imageName } = req.body

        try {
            if (!imagePublicId) {
            return erroResponse(res, 400, 'imagePublicId es requerido');     
        }
        
        const existingFile = await getActivitiesFilesModel(id);
        if (!existingFile) {
        return erroResponse(
          res,
          404,
          'No se encontró imagen vinculada para esta actividad'
        )
        }

        let cloudinaryResource = null
      try {
        cloudinaryResource = await cloudinary.api.resource(imagePublicId, {
          resource_type: 'image',
        })
        if (
          cloudinaryResource?.asset_folder &&
          cloudinaryResource.asset_folder !== 'ARTICULO140IMAGES'
        ) {
          return erroResponse(
            res,
            400,
            'La imagen no pertenece a la carpeta ARTICULO140IMAGES'
          )
        }

        const filePayload = {
        id: existingFile.id, 
        activityId: id,
        fileName: `${imageName || imagePublicId}|${imagePublicId}`,
        url: imageUrl || null,
      }

      await postActivitiesFilesModel(filePayload)
      return successResponse(
        res,
        200,
        'Imagen reemplazada correctamente',
        filePayload
      )

      } catch (err) {
            return erroResponse(res, 400, 'no se pudo validar en Cloudinary', err);
      }
        }catch (error) {
            return erroResponse(res, 400, 'error al actualizar la imagen', error);
         }
    }

    static deleteFilesController = async (req, res) => {
        const { public_id } = req.body;

        try {

            const result = await cloudinary.uploader.destroy(public_id, {
                resource_type: 'image',
            });

            if (result.result !== 'ok') {
                return erroResponse(res, 400, 'No se pudo eliminar el archivo', result);
            }

            return successResponse(res, 200, 'Archivo eliminado con éxito', result);
        } catch (error) {
            return erroResponse(res, error.message);
        }
    }
}