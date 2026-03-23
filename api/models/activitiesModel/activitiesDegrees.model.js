import { pool } from "../../config/db.js";


export const degreeExistsModel = async (id) => {
    const query = "select * from degrees where id = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows
}

export const hasConflictDegreeModel = async (id) => {
    const query = "select * from activities where degreeId = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows
}

export const createDegreeModel = async (degree) => {
    const { code, name, faculty } = degree;
    const query = "insert into degrees (code, name, faculty) values (?,?,?)";
    await pool.execute(query, [code, name, faculty]);
}

export const getDegreesModel = async (options) => {
    
    const {validateLimit, offset, search} = options;

    const searchValue = search ? `%${search}%` : null

    const query = `select * from degrees
                   ${search ? `WHERE (
                    name LIKE ? OR
                    code LIKE ? OR
                    faculty LIKE ?
                    )` : ""}
                    limit ? offset ?`;
    const [rows] = await pool.query(query, searchValue ? [searchValue, searchValue, searchValue, validateLimit, offset] : [validateLimit, offset]);
    return rows;
}

export const getTotalDegreesModel = async (search) => {

    const searchValue = search ? `%${search}%` : null;

    const query = `select count(*) as total from degrees ${search ? `WHERE (
                    name LIKE ? OR
                    code LIKE ? OR
                    faculty LIKE ?
                    )` : ""}`;
    const [result] = await pool.query(query, searchValue ? [searchValue, searchValue, searchValue] : []);
    return result;
}

export const updateDegreeModel = async (degree, id) => {
    const { code, name, faculty } = degree;
    const query = "update degrees set code = ?, name = ?, faculty = ? where id = ?";
    await pool.execute(query, [code, name, faculty, id]);
}

export const deleteDegreeModel = async (id) => {
    const query = "update degrees set isDisabled = 1 where id = ?";
    await pool.execute(query, [id]);
}

export const restoreDegreeModel = async (id) => {
    const query = "update degrees set isDisabled = 2 where id = ?";
    await pool.execute(query, [id]);
}