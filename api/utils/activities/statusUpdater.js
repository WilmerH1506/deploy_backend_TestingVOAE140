import {  pool  } from "../../config/db.js";

export const updateActivitiesStatus = async()=>{
    try {
        const queryUpdateInprogress =`update activities
        set status='inProgress'
        where status = 'pending' and
        startDate <= DATE_SUB(NOW(), INTERVAL 12 HOUR)
        and isDeleted='false'`;
        
        const [inProgressResult] = await pool.query(queryUpdateInprogress);
        console.log(`Estados actualizados: ${inProgressResult.affectedRows} a inProgress`);

    } catch (error) {
        console.log('Hubo un error al actualizar el estado', error.message);
    }
}

setInterval(updateActivitiesStatus, 15 * 60 * 1000);

updateActivitiesStatus();