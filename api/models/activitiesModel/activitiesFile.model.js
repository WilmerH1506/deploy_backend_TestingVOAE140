import {pool} from "../../config/db.js"

export const postActivitiesFilesModel = async(fileData)=>{
    const { id, activityId, fileName, url } = fileData
    
    const query = `
    INSERT INTO files (id, activityId, fileName, url)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      activityId = VALUES(activityId),
      fileName = VALUES(fileName),
      url = VALUES(url),
      updatedAt = CURRENT_TIMESTAMP
  `
    const [result] = await pool.query(query, [id, activityId, fileName, url])
    return result
}

export const getActivitiesFilesModel = async(activityId)=>{
    const query = `SELECT * FROM files WHERE activityId = ? LIMIT 1`
    
    const [rows] = await pool.query(query, [activityId])
    return rows.length > 0 ? rows[0] : null
} 