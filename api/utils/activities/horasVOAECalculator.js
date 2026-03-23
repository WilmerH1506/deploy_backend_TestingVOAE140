import { pool } from "../../config/db.js";

// Función para calcular horas VOAE de un estudiante individual
export const horasVOAECalculator = async (startDate, endDate, entryTime, exitTime, voaeHours, attendanceId) => {
    const hoursActivityTotal = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60);
    const hoursStudentAttendance = (new Date(exitTime) - new Date(entryTime)) / (1000 * 60 * 60);
    const attendancePercentage = (hoursStudentAttendance / hoursActivityTotal) * 100;
    const horasCalculadas = (hoursStudentAttendance / hoursActivityTotal) * voaeHours;
    const hoursAwarded = attendancePercentage >= 55 ? Math.ceil(horasCalculadas) : Math.floor(horasCalculadas);
    
    const query = `UPDATE attendances SET hoursAwarded = ? WHERE id = ?`;
    await pool.query(query, [hoursAwarded, attendanceId]);
    
    return hoursAwarded;
};

export const calculateAllStudentsVOAE = async (activityId) => {
    try {
        
        const activityQuery = `SELECT startDate, endDate, voaeHours FROM activities WHERE id = ?`;
        const [activityData] = await pool.query(activityQuery, [activityId]);
        
        if (activityData.length === 0) {
            throw new Error('Actividad no encontrada');
        }
        
        const { startDate, endDate, voaeHours } = activityData[0];
        
       
        const attendancesQuery = `SELECT id, entryTime, exitTime FROM attendances WHERE activityId = ? AND exitTime IS NOT NULL`;
        const [attendances] = await pool.query(attendancesQuery, [activityId]);
        
        
        for (const attendance of attendances) {
            const { id, entryTime, exitTime } = attendance;
            await horasVOAECalculator(startDate, endDate, entryTime, exitTime, voaeHours, id);
        }
        
        return `Horas VOAE calculadas para ${attendances.length} estudiantes`;
        
    } catch (error) {
        throw new Error(`Error al calcular horas VOAE: ${error.message}`);
    }
};
