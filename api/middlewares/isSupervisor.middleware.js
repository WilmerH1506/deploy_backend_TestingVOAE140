import jwt from "jsonwebtoken"

export const isSupervisor = async (req,res,next)=>{
    const {authorization}=req.headers

   try{
     const token = authorization.split(" ")[1]
    const decoded= jwt.verify(token,process.env.JWT_SECRET)

    if(decoded.role !=="supervisor"){
        return res.status(401).json({message:`Solo Supervisores tienen acceso a esta ruta ${req.url}`})
    }

    next()
   }catch(error){return res.status(403).json({ message: 'Error con el JWT',error })}
}