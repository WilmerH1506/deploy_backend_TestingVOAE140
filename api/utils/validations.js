
// helpers/validateResult.js
export const validateResult = (result, res, customMessage = "Error al validar los datos") => {
    if (!result.success) {
        return res.status(400).json({
            message: customMessage,
            errors: result.error.format(),
        });
    }
    return null; 
};

export const validateUserDb= (Exist,res,customMessage="usuario no Existe")=>{
    if (!Exist ||Exist.length ===0) {
            return res.status(404).json({ message: customMessage });
        }
        return null
}