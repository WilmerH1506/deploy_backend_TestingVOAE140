import XLSX from "xlsx";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { validateExcelRows } from "../schemas/ActivitiesSchema/excelImportSchema.js";

const DEFAULT_DEGREE_ID = 1;
const toUnique = (arr) => [...new Set(arr.filter(Boolean))];
const buildRowError = (rowNumber, message) => ({ row: rowNumber, message });

const prisma = new PrismaClient();

const parseBuffer = (buffer) => { 
    try{
        const workbook = XLSX.read(buffer, {type:"buffer"});
        const sheetName = workbook.SheetNames[0];

        if(!sheetName){
            throw new Error("El archivo no contiene hojas válidas");
        }
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {defval:""});
        if(data.length===0){
            throw new Error("El archivo está vacío");
        }
        return data;
    }catch(error){
        throw new Error(`Error al leer el archivo Excel: ${error.message}`);
    }
};

const sanitizeRows = (rows) => rows.map((row) => ({
    ...row,
    accountNumber: row.accountNumber != null ? String(row.accountNumber).trim() : row.accountNumber,
    name: row.name != null ? String(row.name).trim() : row.name,
    email: row.email != null ? String(row.email).trim() : row.email,
    identityNumber: row.identityNumber != null ? String(row.identityNumber).trim() : row.identityNumber,
    degreeCode: row.degreeCode != null ? String(row.degreeCode).trim() : row.degreeCode,
    observations: row.observations != null ? String(row.observations).trim() : row.observations,
}));

export const processImportFile = async (buffer, activityId, { allowFinishedImport = false } = {}) => {
    const parsedRows = sanitizeRows(parseBuffer(buffer));
    const { validRows, errors: validationErrors } = validateExcelRows(parsedRows);

    if (validRows.length === 0) {
        return { created: 0, existing: 0, registered: 0, attendanceSaved: 0, errors: validationErrors };
    }

    const accountNumbers = toUnique(validRows.map(r => r.accountNumber));
    const emails = toUnique(validRows.map(r => r.email));
    const identities = toUnique(validRows.map(r => r.identityNumber).filter(Boolean));
    const degreeCodes = toUnique(validRows.map(r => r.degreeCode).filter(Boolean));

    try {
        const result = await prisma.$transaction(async (tx) => {
            const [existingUsers, degrees, activity] = await Promise.all([
                tx.users.findMany({
                    where: {
                        OR: [
                            { accountNumber: { in: accountNumbers } },
                            { email: { in: emails } },
                            ...(identities.length > 0 ? [{ identityNumber: { in: identities } }] : [])
                        ]
                    },
                    select: { id: true, accountNumber: true, email: true, identityNumber: true }
                }),
                degreeCodes.length > 0 ? tx.degrees.findMany({
                    where: { code: { in: degreeCodes } },
                    select: { id: true, code: true }
                }) : Promise.resolve([]),
                tx.activities.findUnique({
                    where: { id: activityId },
                    select: { id: true, status: true, availableSpots: true }
                })
            ]);

            if (!activity) {
                return {
                    created: 0, existing: 0, registered: 0, attendanceSaved: 0,
                    errors: [{ row: null, message: "Actividad no encontrada" }]
                };
            }

            if (allowFinishedImport && activity.status !== 'finished') {
                return {
                    created: 0, existing: 0, registered: 0, attendanceSaved: 0,
                    errors: [{ row: null, message: "La actividad debe estar finalizada para importar asistencias" }]
                };
            }

            const existingByAccountNumber = new Map(existingUsers.map(u => [u.accountNumber, u]));
            const existingByEmail = new Map(existingUsers.map(u => [u.email, u]));
            const existingByIdentity = new Map(existingUsers.map(u => u.identityNumber ? [u.identityNumber, u] : null).filter(Boolean));
            
            const degreeMap = new Map(degrees.map(d => [d.code, d.id]));
            
            const seenEmails = new Set();
            const seenIdentities = new Set();
            const rowsToCreate = [];
            const preCreateErrors = [];
            const rejectedRowNumbers = new Set(); 
            const existingMap = new Map(); 

            for (const row of validRows) {
                let foundStudent = null;

                if (existingByAccountNumber.has(row.accountNumber)) {
                    foundStudent = existingByAccountNumber.get(row.accountNumber);
                } else if (existingByEmail.has(row.email)) {
                    foundStudent = existingByEmail.get(row.email);
                } else if (row.identityNumber && existingByIdentity.has(row.identityNumber)) {
                    foundStudent = existingByIdentity.get(row.identityNumber);
                }

                if (foundStudent) {
                    existingMap.set(row.accountNumber, foundStudent.id);
                    continue;
                }

                if (seenEmails.has(row.email)) {
                    preCreateErrors.push(buildRowError(row.rowNumber, "Email duplicado en el archivo"));
                    rejectedRowNumbers.add(row.rowNumber);
                    continue;
                }
                if (row.identityNumber && seenIdentities.has(row.identityNumber)) {
                    preCreateErrors.push(buildRowError(row.rowNumber, "Cédula duplicada en el archivo"));
                    rejectedRowNumbers.add(row.rowNumber);
                    continue;
                }

                seenEmails.add(row.email);
                if (row.identityNumber) seenIdentities.add(row.identityNumber);
                rowsToCreate.push(row);
            }

            let createdCount = 0;
            const createdMap = new Map();

            if (rowsToCreate.length > 0) {
                const usersToCreate = rowsToCreate.map(row => {
                    const id = uuidv4();
                    createdMap.set(row.accountNumber, id);
                    return {
                        id,
                        name: row.name,
                        email: row.email,
                        password: bcrypt.hashSync(String(row.accountNumber), 10),
                        accountNumber: row.accountNumber,
                        identityNumber: row.identityNumber || null,
                        role: 'student',
                        degreeId: degreeMap.get(row.degreeCode) || DEFAULT_DEGREE_ID,
                        isDeleted: 'false'
                    };
                });

                const createResult = await tx.users.createMany({
                    data: usersToCreate
                });
                createdCount = createResult.count;
            }

            const studentMap = new Map([...existingMap, ...createdMap]);
            const existingCount = existingMap.size;
            
            const uniqueStudentIds = Array.from(new Set(
                validRows
                    .filter(row => !rejectedRowNumbers.has(row.rowNumber))
                    .map(row => studentMap.get(row.accountNumber))
                    .filter(Boolean)
            ));

            let existingRegistrations = [];
            let existingAttendances = [];
            
            if (uniqueStudentIds.length > 0) {
                const results = await Promise.all([
                    tx.registrations.findMany({
                        where: { activityId, studentId: { in: uniqueStudentIds } },
                        select: { studentId: true }
                    }),
                    tx.attendances.findMany({
                        where: { activityId, studentId: { in: uniqueStudentIds } },
                        select: { studentId: true }
                    })
                ]);
                existingRegistrations = results[0];
                existingAttendances = results[1];
            } else {
                existingAttendances = await tx.attendances.findMany({
                    where: { activityId },
                    select: { studentId: true }
                });
            }

            const alreadyRegisteredSet = new Set(existingRegistrations.map(r => r.studentId));
            const existingAttendanceSet = new Set(existingAttendances.map(a => a.studentId));
            
            const alreadyProcessedSet = new Set([...alreadyRegisteredSet, ...existingAttendanceSet]);
            const toRegister = uniqueStudentIds.filter(id => !alreadyProcessedSet.has(id));

            let newlyRegisteredCount = 0;
            const skipped = [];

            if (toRegister.length > 0) {
                const allowedCount = allowFinishedImport
                    ? toRegister.length
                    : Math.min(Number(activity.availableSpots) || 0, toRegister.length);

                if (allowedCount > 0) {
                    await tx.registrations.createMany({
                        data: toRegister.slice(0, allowedCount).map(id => ({
                            studentId: id,
                            activityId
                        })),
                        skipDuplicates: true
                    });

                    newlyRegisteredCount = allowedCount;

                    if (!allowFinishedImport) {
                        await tx.activities.update({
                            where: { id: activityId },
                            data: { availableSpots: { decrement: allowedCount } }
                        });
                    }
                }

                if (!allowFinishedImport && allowedCount < toRegister.length) {
                    skipped.push(...toRegister.slice(allowedCount));
                }
            }

            const registeredSet = new Set([
                ...alreadyProcessedSet,
                ...toRegister.slice(0, newlyRegisteredCount)
            ]);
            const attendances = [];
            const attendanceErrors = [];
            const seenAttendances = new Set();

            for (const row of validRows) {
                if (rejectedRowNumbers.has(row.rowNumber)) {
                    continue;
                }

                const studentId = studentMap.get(row.accountNumber);
                
                if (!studentId) {
                    attendanceErrors.push(buildRowError(row.rowNumber, "No se pudo obtener el estudiante"));
                    continue;
                }
                
                if (!registeredSet.has(studentId)) {
                    attendanceErrors.push(buildRowError(row.rowNumber, "Estudiante no inscrito (sin cupos o actividad cerrada)"));
                    continue;
                }

                if (existingAttendanceSet.has(studentId)) {
                    attendanceErrors.push(buildRowError(row.rowNumber, "Estudiante ya tiene asistencia registrada en esta actividad"));
                    continue;
                }

                if (seenAttendances.has(studentId)) {
                    attendanceErrors.push(buildRowError(row.rowNumber, "Asistencia duplicada del estudiante en este archivo"));
                    continue;
                }

                seenAttendances.add(studentId);
                attendances.push({
                    id: uuidv4(),
                    studentId,
                    activityId,
                    entryTime: new Date(row.entryTime),
                    exitTime: new Date(row.exitTime),
                    observations: row.observations || null
                });
            }

            let attendanceSaved = 0;
            if (attendances.length > 0) {
                const attResult = await tx.attendances.createMany({
                    data: attendances
                });
                attendanceSaved = attResult.count;
            }

            return {
                created: createdCount,
                existing: existingCount,
                registered: newlyRegisteredCount,
                attendanceSaved,
                errors: [
                    ...validationErrors,
                    ...preCreateErrors,
                    ...skipped.map(() => ({ row: null, message: "Sin cupo disponible" })),
                    ...attendanceErrors
                ]
            };
        });

        return result;

    } catch (error) {
        console.error("Error en processImportFile:", error);
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'desconocido';
            return {
                created: 0, existing: 0, registered: 0, attendanceSaved: 0,
                errors: [{
                    row: null,
                    message: `Algunos registros tienen ${field} duplicados. Verifica el archivo y reintenta.`
                }]
            };
        }
        throw error;
    }
};