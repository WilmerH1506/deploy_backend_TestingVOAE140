import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import activitiesRouter from "./api/routes/activities.routes.js";
import "./api/utils/activities/statusUpdater.js"
import AuthRouter from "./api/routes/auth.routes.js";
import UserRouter from "./api/routes/users.routes.js"
import aboutRouter from "./api/routes/about.routes.js"
import swaggerSpec from "./api/config/swaggerOptions.js";
import swaggerUi from "swagger-ui-express";

/**
 * Punto de entrada de la aplicación.
 *
 * Utiliza:
 * - Express: para la creación de la API REST.
 * - dotenv: para la gestión de variables de entorno.
 * - cors: para la configuración de políticas CORS.
 *
 * Define las rutas principales y configura los middlewares globales.
 *
 * @module server
 */

const app=express()
dotenv.config();
/**
 * Puerto en el que se ejecuta el servidor.
 * @type {number|string}
 */
const PORT = process.env.PORT || 3000
app.use(express.json())

app.use(cors({
    methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Bearer', 'api-key'],
    origin: process.env.CORS_ORIGIN || 'localhost:4000' || 'localhost:3000'
}))

app.use('/api/activities',activitiesRouter)
app.use("/api/auth",AuthRouter)
app.use("/api/users",UserRouter)
app.use("/api/about",aboutRouter)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use((req,res)=>{
    res.status(404).json({message:`${req.url} no fue encontrada`})
})

/**
 * Inicia el servidor en el puerto especificado.
 * @param {number|string} PORT
 */
app.listen(PORT,()=>{
    console.log(`Server running on port localhost:${PORT}`)
})