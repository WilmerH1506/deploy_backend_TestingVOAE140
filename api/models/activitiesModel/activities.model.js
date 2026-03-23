import {pool} from "../../config/db.js"
import { deshabilitarActividad, habilitarActividad, calcularStatusPorFechas } from "../../utils/activities/estatusManual.js";



export const getActividadModel =async(options)=>{

    const {validateLimit,offset,search}= options;

    const searchValue = search ? `%${search}%` : null;

    const query = `select a.id, a.title,a.description,a.startDate, a.endDate, a.voaeHours, a.availableSpots,a.status,a.isDeleted,a.isDisabled, u.name as Supervisor,u.id as supervisorId, group_concat(ase.scope) as scopes from activities as a
    inner join users as u on a.supervisorId = u.id
    inner join activityScopes as ase on a.id = ase.activityId
    where a.isDeleted = 'false'
    group by a.id, a.title,a.description, a.startDate, a.endDate, a.voaeHours, a.availableSpots, a.status, u.name, u.id, a.isDeleted, a.isDisabled
    ${search ? `HAVING (
            a.title                        LIKE ? OR
            CAST(a.voaeHours AS CHAR)      LIKE ? OR
            u.name                         LIKE ? OR
            GROUP_CONCAT(ase.scope)        LIKE ?
        )` : ""}
    order by a.startDate DESC
    limit ? offset ?`; 

    const [rows] = await pool.query(query, searchValue ? [searchValue, searchValue, searchValue, searchValue, validateLimit, offset] : [validateLimit, offset]);
    return rows;
}

export const TotalActividadModel =async(search)=>{

    const searchValue = search ? `%${search}%` : null;

    const query = `
        SELECT COUNT(*) AS total
        FROM (
            SELECT a.id
            FROM activities AS a
            INNER JOIN users          AS u   ON a.supervisorId = u.id
            INNER JOIN activityScopes AS ase ON a.id = ase.activityId
            WHERE a.isDeleted = 'false'
            GROUP BY a.id, a.title, a.voaeHours, u.name, a.isDeleted
            ${search ? `HAVING (
                a.title                   LIKE ? OR
                CAST(a.voaeHours AS CHAR) LIKE ? OR
                u.name                    LIKE ? OR
                GROUP_CONCAT(ase.scope)   LIKE ?
            )` : ""}
        ) AS filtered
    `
    const [rows] = await pool.query(query, searchValue ? [searchValue, searchValue, searchValue, searchValue] : []);
    return rows;
}

export const getDefaultAdminModel = async () => {
    const query = `SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    const [rows] = await pool.query(query);
    return rows;
}


export const getActividadbyIdModel =async(id)=>{

    const query =`select a.id, a.title,a.description,a.startDate, a.endDate, a.voaeHours, a.availableSpots,a.status,a.isDeleted,a.isDisabled, u.name as Supervisor, u.id as SupervisorId, group_concat(ase.scope) as scopes from activities as a
    inner join users as u on a.supervisorId = u.id
    inner join activityScopes as ase on a.id = ase.activityId
    where a.id = ? and a.isDeleted = 'false' 
    group by a.id, a.title, a.description, a.startDate, a.endDate, a.voaeHours, a.availableSpots, a.status, u.name, u.id, a.isDeleted, a.isDisabled`;

    const [rows] = await pool.query(query,[id]);
    return rows;
}

export const confirmSupervisor = async (id) => {
    const query = `select * from users where id = ? and role = 'supervisor'`;
    const [rows] = await pool.query(query, [id]);
    return rows;
}

export const getActivitiesForSupervisorModel = async (id) => {

    const query = `select a.title, a.description, d.name, d.faculty , a.startDate, a.endDate, a.availableSpots 
                    from activities as a 
                    inner join users as u on a.supervisorId = u.id
                    inner join degrees as d on d.id = a.degreeId
                    where u.id = ? and a.status = 'pending'`;

    const [rows] = await pool.query(query, [id]);
    return rows;
}

export class ValidateCreateActivitiesModel {
    static validateActivitiesModel = async(data)=>{
        const {startDate,endDate} = data;
        const query = `select * from activities as a
        where a.startDate < ? AND a.endDate > ?`;
        const [rows] = await pool.query(query, [endDate, startDate]);
        console.log(rows);
        return rows.length > 0;
    }

    static crearActividadModel =async(data)=>{
    const {id,title,description,degreeId,startDate,endDate,voaeHours,availableSpots,supervisorId,status,scopes}= data;
    
    const conn = await pool.getConnection();
    try {
    await conn.beginTransaction();
        const query = `insert into activities(id,title,description,degreeId,startDate,endDate,voaeHours,availableSpots,supervisorId)
    values(?,?,?,?,?,?,?,?,?)`;

    await conn.execute(query,[id,title,description,degreeId,startDate,endDate,voaeHours,availableSpots,supervisorId]);

    for (const scope of scopes) {
        const queryActividad_scope = `insert into activityScopes(activityId,scope)
        values(?,?)`;
        await conn.execute(queryActividad_scope,[id,scope]);
    }

    conn.commit();
    return;
    } catch (error) {
        conn.rollback();
        throw error;
    }finally{
        conn.release();
    }

    }

    static createExternalActivityModel = async(data)=>{
        const {id,title,description,degreeId,startDate,endDate,voaeHours,availableSpots,supervisorId,scopes}= data;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const query = `insert into activities(id,title,description,degreeId,startDate,endDate,voaeHours,availableSpots,supervisorId,status)
            values(?,?,?,?,?,?,?,?,?,?)`;
            await conn.execute(query,[id,title,description,degreeId,startDate,endDate,voaeHours,availableSpots,supervisorId,'external']);

            for (const scope of scopes) {
                const queryActividad_scope = `insert into activityScopes(activityId,scope)
                values(?,?)`;
                await conn.execute(queryActividad_scope,[id,scope]);
            }

            conn.commit();
            return;
        } catch (error) {
            conn.rollback();
            throw error;
        }finally{
            conn.release();
        }
    }
}


export class ValitateUpdateActivitiesModel {
    static validateActivitiesDelete = async(actividadId)=>{
        const queryIsdelete = `select isDeleted from activities where id =?`;
    
        const [rows] = await pool.query(queryIsdelete,[actividadId]);
        return rows[0].isDeleted;
    }

    static putActividadbyidModel =async(data)=>{
    const {actividadId,title,description,startDate,endDate,voaeHours,
    availableSpots,supervisorId,scopes,isDisable}= data;

    console.log(`[putActividadbyidModel] isDisable=${isDisable}, typeof=${typeof isDisable}, data.isDisable=${data.isDisable}`);

    const conn = await pool.getConnection();
    try {
    await conn.beginTransaction();
        const query = `update activities
        set title=?,description=?,startDate=?,endDate=?,voaeHours=?,
        availableSpots=?,supervisorId=?
        where id=?`;

    await conn.execute(query,[title,description,startDate,endDate,voaeHours,
availableSpots,supervisorId,actividadId]);

    const queryDeleteAmbito= `Delete from activityScopes where activityId=?`
    await conn.execute(queryDeleteAmbito,[actividadId])
    for (const scope of scopes) {
        const queryActividad_scope = `insert into activityScopes(activityId,scope)
        values(?,?)`;
        await conn.execute(queryActividad_scope,[actividadId,scope]);
    }

    // Procesar deshabilitar si isDisable === 1
    if (isDisable === 1) {
        await deshabilitarActividad(isDisable, actividadId, conn);
    } else {
        // Si no se deshabilita (isDisable !== 1), siempre recalcular status por cambio de fechas
        await calcularStatusPorFechas(actividadId, conn);
    }

    conn.commit();
    return data;
    } catch (error) {
        conn.rollback();
        throw error;
    }finally{
        conn.release();
    }
}
}

export class ValitateActivitiesDisableEnableModel {
    static validateActivitiesDelete = async(actividadId)=>{
        const queryIsdelete = `select isDeleted from activities where id =?`;
    
        const [rows] = await pool.query(queryIsdelete,[actividadId]);
        return rows[0].isDeleted;
    }

    static putActividadDisableModel =async(data)=>{
        const {actividadId}= data;

        const query =`update activities set isDisabled='true'
        where id=? and isDeleted='false'`
        const [rows] = await pool.query(query,[actividadId]);
        return rows
        
    }

    static putActividadEnableModel =async(data)=>{
        const {actividadId}= data;

        const query =`update activities set isDisabled='false'
        where id=? and isDeleted='false'`
        const [rows] = await pool.query(query,[actividadId]);
        return rows
    }

    static getActiviyenableDisable =async(id)=>{

        const query =`select a.isDisabled from activities as a
                    where id=?`
        const [rows] = await pool.query(query,[id]); 
        return rows[0]
       
    }
}



export class ValidateDeleteActivitiesModel {

    static getDeletedActivitiesModel = async (options) => {

        const { validateLimit, offset } = options;

        const query = `select a.id, a.title, a.description, u.name as supervisor , a.startDate, a.endDate, a.voaeHours, group_concat(ase.scope) as scopes , a.availableSpots from activities as a
                       inner join users as u on u.id = a.supervisorId
                       inner join activityScopes as ase on ase.activityId = a.id 
                       where a.isDeleted = 'true'
                       group by a.id, a.title, a.description, a.startDate, a.endDate, a.voaeHours, a.availableSpots, u.name
                       limit ? offset ?`;

        const [rows] = await pool.query(query,[validateLimit, offset]);
        return rows;

    }

    static totalDeletedActivitiesModel = async () => {
        const query = `select COUNT(*) as total from activities where isDeleted = 'true'`;
        const [rows] = await pool.query(query);
        return rows;
    }
    
    static validateActivitiesModel =async(id)=>{
        const queryInscripcion = `select *from registrations where activityId = ?`;
        const [registros] = await pool.query(queryInscripcion,[id]);
        
        const queryDeleted = `select status,isDeleted from activities where id = ?`;
        const [rows] = await pool.query(queryDeleted,[id]);
        
        return {
            inscripcion:registros[0],
            status:rows[0].status,
            isDeleted:rows[0].isDeleted,
        };
    }

    static deleteActivitiesModel =async(id)=>{
        const query = `update activities 
        set isDeleted ='true'
        where id =?`
        await pool.query(query,[id]);
    }

    static restoreActivitiesModel =async(id)=>{
        const query = `update activities 
        set isDeleted ='false'
        where id =?`
        await pool.query(query,[id]);
    }
}

export const updatestatusActivity =async(data)=>{
    const {actividadId,status}= data;
    const query = `update activities
        set status=?
        where id=?`; 

    const [rows] = await pool.query(query,[status,actividadId]);
    return rows;
}
