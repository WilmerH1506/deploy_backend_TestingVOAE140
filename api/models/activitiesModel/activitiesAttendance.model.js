import { pool } from "../../config/db.js";

export const registerAttendanceModel = async (attendances) => {
  
  const cnn = await pool.getConnection();
  const query =  `insert into attendances (id,studentId,activityId,entryTime,exitTime,observations)
                  values (?, ?, ?, ?, ?, ?)`


  try {
    await cnn.beginTransaction();
    
    for (const att of attendances) {

       const { id, studentId, activityId, entryTime, exitTime, observations } = att;

       await cnn.execute(query, [id, studentId, activityId, entryTime, exitTime, observations]);
    }
      
    cnn.commit();

  } catch (error) {
    cnn.rollback();
    throw error;
  } finally {
    cnn.release();
  }
};

export const getAttendanceModel = async (options) => {
  const {validateLimit,offset,activityid} =options;
  
  try{

    const query = `select a.id as attendanceId, u.accountNumber, u.name, a.entryTime, a.exitTime , a.hoursAwarded, group_concat(ac.scope) as Scope 
                   from attendances as a
                   inner join users as u on u.id = a.studentId
                   inner join activityScopes as ac on ac.activityId = a.activityId
                   where a.activityId = ?
                   group by a.id, u.name, u.accountNumber, u.email, a.entryTime, a.exitTime, a.hoursAwarded
                   order by u.accountNumber DESC
                   LIMIT ? OFFSET ?`

    const [rows] = await pool.query(query, [activityid, validateLimit, offset])
    return rows
    
  } catch(error) {
    console.log(error)
    throw error;
  }
}

export const TotalAttendanceModel =async(activityid)=>{
    const query = `SELECT COUNT(*) as total FROM attendances WHERE activityId = ?`; 
    const [rows] = await pool.query(query, [activityid]);
    return rows;
}

export const updateHoursAwardedModel = async (attendanceId, hoursAwarded) =>{
    const query =`UPDATE attendances 
      SET hoursAwarded = ? 
      WHERE id = ?`;
    const [rows] = await pool.query(query,[hoursAwarded, attendanceId]);
    return rows;
};

export const getAttendanceByIdModel = async (attendanceId) => {
  const query = `
      SELECT a.*, u.name, u.accountNumber 
      FROM attendances as a
      INNER JOIN users as u ON u.id = a.studentId
      WHERE a.id = ?
    `;
    const [rows] = await pool.query(query,[attendanceId]);
    return rows[0];
}
