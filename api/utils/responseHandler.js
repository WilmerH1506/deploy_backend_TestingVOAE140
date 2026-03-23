
export const successResponse = (res,status,messageR,data=null)=>{
    return res.status(status).json({message:messageR,data})

}

export const erroResponse = (res,status,messageR,error=null)=>{
    return res.status(status).json({message:messageR,error})
}