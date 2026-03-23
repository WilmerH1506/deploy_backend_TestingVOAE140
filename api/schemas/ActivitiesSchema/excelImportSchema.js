import z from "zod";

const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const ExcelRowSchema = z.object({
  accountNumber: z.string().trim().min(1, "accountNumber requerido"),
  name: z.string().trim().min(3, "name requerido"),
  email: z.string().trim().email("email invalido"),
  entryTime: z.string().trim().regex(dateTimeRegex, "entryTime debe tener formato YYYY-MM-DD HH:MM:SS"),
  exitTime: z.string().trim().regex(dateTimeRegex, "exitTime debe tener formato YYYY-MM-DD HH:MM:SS"),
  identityNumber: z.string().trim().optional().or(z.literal("")),
  degreeCode: z.string().trim().optional().or(z.literal("")),
  observations: z.string().trim().max(255).optional().or(z.literal(""))
}).strict();

export const validateExcelRows = (rows) => {
  const errors = [];
  const validRows = [];

  rows.forEach((row, index) => {
    const parsed = ExcelRowSchema.safeParse(row);

    if (!parsed.success) {
      errors.push({
        row: index + 2, 
        issues: parsed.error.issues.map(i => i.message)
      });
      return;
    }

    const cleaned = {
      ...parsed.data,
      identityNumber: parsed.data.identityNumber || null,
      degreeCode: parsed.data.degreeCode || null,
      observations: parsed.data.observations || null
    };

    validRows.push({ ...cleaned, rowNumber: index + 2 });
  });

  return { validRows, errors };
};