import { success } from "zod";
import {pool} from "../../config/db.js"

export const studentExists = async (studentID) => {
    const [rows] = await pool.execute(`select * from users where id = ?`, [studentID]);
    return rows
}

export const activityExists = async (activityID) => {
    const [rows] = await pool.execute(`select * from activities where id = ?`, [activityID]);
    return rows
}

export const registerStudentModel = async (studentID, activityID) => {

    const cnn = await pool.getConnection();
    await cnn.beginTransaction();

     const query = `insert into registrations (studentId, activityId, registrationDate)
                    select ?, ?, CURDATE()
                    from activities
                        where id = ?
                        and availableSpots > 0
                        and status = 'pending'`;

    const queryUpdate = `update activities set availableSpots = availableSpots - 1 where id = ?`;

    try  {

        const [insertResult] = await cnn.execute(query, [studentID, activityID, activityID]);

        if (insertResult.affectedRows === 0) {
            await cnn.rollback();
            return {success:false,message: 'No hay cupos disponibles o la actividad no está disponible para inscripciones.'};
        }

        await cnn.execute(queryUpdate, [activityID]);
        await cnn.commit();

        return {success:true,message: 'Estudiante registrado con éxito en la actividad.'};

    } catch (error) {
        cnn.rollback();
        throw error
    }
    finally{
        cnn.release();
    }
}

export const getStudentsbyActivityIDModel =async(Activityid)=>{

    const query =`select u.id, u.name, u.accountNumber, a.entryTime, a.exitTime 
    from users as u
    inner join registrations as r on u.id = r.studentId
    left join attendances as a on u.id = a.studentId and r.activityId = a.activityId
    where r.activityId = ?`;

    const [rows] = await pool.query(query,[Activityid]);
    return rows;
}



export const closeInscriptionsModel = async (activityID) => {

    const cnn = await pool.getConnection();
    await cnn.beginTransaction();
   
    try{

        const query = `update activities set status = 2 where id = ?`;

        await cnn.execute(query, [activityID]);

        cnn.commit();


    } catch (error) {
        cnn.rollback();
        throw error;
    } finally {
        cnn.release();
    }
}

        

export const closeActivityModel = async (activityID) => {

    const cnn = await pool.getConnection();
    await cnn.beginTransaction();

    try{

        const query = `update activities
        set status='finished'
        where id = ? and isDeleted='false'`;

        await cnn.execute(query, [activityID]);
        cnn.commit();

    } catch (error) {
        cnn.rollback();
        throw error;
    } finally {
        cnn.release();
    }

}

