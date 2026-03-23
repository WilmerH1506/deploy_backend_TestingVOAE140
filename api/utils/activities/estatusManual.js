import { pool } from '../../config/db.js';

export const deshabilitarActividad = async (isDisable, actividadId, connection = null) => {
    const conn = connection || pool;
    if (isDisable !== 1) {
        return; 
    }
    
    try{
        const queryDeshabilitar = `update activities SET isDisabled='true' WHERE id=? AND isDeleted='false'`;
        const [rows]= await conn.execute(queryDeshabilitar, [actividadId]);
        return rows
    }catch(error){
        console.log(error)
    }
    
};

export const habilitarActividad = async (isDisable, actividadId, connection = null) => {
    if (isDisable !== 0) { 
        return; 
    }
    const conn = connection || pool;

    await conn.execute(`update activities SET isDisabled='false' WHERE id=? AND isDeleted='false'`, [actividadId]);
    await calcularStatusPorFechas(actividadId, conn);
};

export const calcularStatusPorFechas = async (actividadId, connection = null) => {
    const conn = connection || pool;
    const queryFechas = `select startDate, endDate from activities WHERE id=? AND isDeleted='false'`;
    const [rows] = await conn.execute(queryFechas, [actividadId]);
    
    if (rows.length === 0) return;
    
    const { startDate, endDate } = rows[0];
    const ahora = new Date();
    let nuevoStatus;

    // pending si la actividad aun no inicia, inProgress si esta en curso, finished si ya termino
    if (ahora < new Date(startDate)) {
        nuevoStatus = 'pending';
    } else if (endDate && ahora > new Date(endDate)) {
        nuevoStatus = 'finished';
    } else {
        nuevoStatus = 'inProgress';
    }

    const queryUpdate = `update activities SET status=? where id=?`;
    
    await conn.execute(queryUpdate, [nuevoStatus, actividadId]);
};