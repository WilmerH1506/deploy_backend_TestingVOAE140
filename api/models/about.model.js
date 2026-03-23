import { pool } from "../config/db.js";

export const getSectionsModel = async () => {

    const query = 'select * from about_sections'

    const [result] = await pool.query(query)
    return result
}

export const updateSectionModel = async (data) => {

    const {carousel,mision_vision,competencies, goals} = data

    const query = `update about_sections set carousel=?, mision_vision=?, competencies=?, goals=? where id=1`

    const [result] = await pool.query(query, [carousel,mision_vision,competencies, goals])
    return result
}

export const getPostsModel = async (category) => {
  let query = `
    SELECT p.*, COUNT(v.id) as view_count
    FROM about_posts p
    LEFT JOIN about_post_views v ON v.post_id = p.id
    WHERE p.is_visible = 1
    ${category ? 'AND p.category = ?' : ''}
    GROUP BY p.id
    ORDER BY p.is_pinned DESC, p.created_at DESC
  `
  const params = category ? [category] : []
  const [result] = await pool.query(query, params)
  return result
}

export const getPostByIdModel = async (id) => {
  const query = `
    SELECT p.*, COUNT(v.id) as view_count
    FROM about_posts p
    LEFT JOIN about_post_views v ON v.post_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `
  const [result] = await pool.query(query, [id])
  return result[0]
}

export const getAdminPostsModel = async () => {
  const query = `
    SELECT p.*, COUNT(v.id) as view_count
    FROM about_posts p
    LEFT JOIN about_post_views v ON v.post_id = p.id
    GROUP BY p.id
    ORDER BY p.is_pinned DESC, p.created_at DESC
  `
  const [result] = await pool.query(query)
  return result
}

export const createPostModel = async (data) => {

    const {title,content,image_url,category,
        is_pinned,is_visible,event_date,event_place} = data

    const query = `insert into about_posts (id,title,content,image_url,category,is_pinned,is_visible,event_date,event_place) values (uuid(),?,?,?,?,?,?,?,?)`

    const [result] = await pool.query(query, [title,content,image_url,category,
        is_pinned,is_visible,event_date,event_place])

    return result
}

export const updatePostModel = async (id, data) => {

    const {title,content,image_url,category,
           is_pinned,is_visible,event_date,event_place} = data
    
    const query = `update about_posts set title=?,content=?,image_url=?,category=?,is_pinned=?,is_visible=?,event_date=?,event_place=? where id=?`

    const [result] = await pool.query(query, [title,content,image_url,category,is_pinned,is_visible,event_date,event_place,id])

    return result
}

export const deletePostModel = async (id) => {

    const query = `delete from about_posts where id=?`
    const [result] = await pool.query(query, [id])
    return result
}

export const togglePostVisibilityModel = async (id, is_visible) => {

    const query = `update about_posts set is_visible=? where id=?`
    const [result] = await pool.query(query, [is_visible, id])
    return result
}

export const togglePostPinModel = async (id, is_pinned) => {

    const query = `update about_posts set is_pinned=? where id=?`
    const [result] = await pool.query(query, [is_pinned, id])
    return result
}

export const incrementPostViewsModel = async (post_id,viewer_key) => {
    const query = `insert ignore into about_post_views (id,post_id,viewer_key) values (uuid(),?,?)`
    const [result] = await pool.query(query, [post_id,viewer_key])
    return result
}
