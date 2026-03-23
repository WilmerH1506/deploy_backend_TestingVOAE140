import { de } from "zod/locales";
import { pool } from "../config/db.js";

export const RegisterUserBD = async (users) =>{

    const query = 'INSERT INTO users (id,name,email,password,accountNumber,identityNumber,role,degreeId) values(?,?,?,?,?,?,?,?)'

    const [resultado] = await pool.query(query,[...users])

    return resultado
}

export const GetUserByEmailDB = async (user)=>{

    const query = "Select id,name,email,role,isDeleted,password from users where email = ?"

    const [resultado] = await pool.query(query,user)
    return resultado[0]
}

export const ChangePassDb = async (password,id) =>{
    const query = "UPDATE users SET password = ? WHERE id = ?"
    const [resultado] = await pool.query(query,[password,id])
    return resultado
}

export const VerifyPasswordDB = async (email,id) =>{
    const query= "Select password,email from users where email=? and id =?"

    const [resultado] = await pool.query(query,[email,id])
    return resultado
}

export const userExist = async (id)=>{
    const query= "Select * from users where id=? or accountNumber = ? or identityNumber = ? "

    const [resultado] = await pool.query(query,[id,id,id])
    return resultado
}

export const AdminChangeDb = async (id,role)=>{
    const query = "UPDATE users set role = ? where id = ?"

    const [resultado] = await pool.query(query,[id,role])
    return resultado
}

export const UpdateDataDB= async (name,email,degreeId,id)=>{
    const query = "Update users set name = ? ,email = ? , degreeId=? where id = ?"

    const [result] = await pool.query(query,[name,email,degreeId,id])
    return result
}

export const DeleteUserDB = async (id)=>{
    const query="UPDATE users set isDeleted = TRUE where id = ?"

    const [result] = await pool.query(query,[id])

    return result
}