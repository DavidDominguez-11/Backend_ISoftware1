const pool = require("../../src/config/db");

describe("Trigger actualizar_fecha_fin en tabla proyectos", () => {
  let clienteId;
  let proyectoId;

  beforeAll(async () => {
    // Limpiar tablas antes de empezar
    await pool.query("DELETE FROM proyectos;");
    await pool.query("DELETE FROM clientes;");

    // Crear cliente de prueba
    const clienteRes = await pool.query(`
      INSERT INTO clientes (nombre, telefono)
      VALUES ('Cliente Test', '12345678')
      RETURNING id;
    `);
    clienteId = clienteRes.rows[0].id;
  });

  afterAll(async () => {
    await pool.end();
  });

  test("1️⃣ Crear proyecto en estado 'Solicitado' debe tener fecha_fin = NULL", async () => {
    const result = await pool.query(`
      INSERT INTO proyectos (nombre, estado, presupuesto, cliente_id, fecha_inicio, tipo_servicio)
      VALUES ('Proyecto Test', 'Solicitado', 10000, $1, CURRENT_DATE, 'Piscina Regular')
      RETURNING id, estado, fecha_fin;
    `, [clienteId]);

    const proyecto = result.rows[0];
    proyectoId = proyecto.id;

    expect(proyecto.estado).toBe("Solicitado");
    expect(proyecto.fecha_fin).toBeNull();
  });

  test("2️⃣ Al cambiar a 'Finalizado', debe asignar fecha actual automáticamente", async () => {
    const updateRes = await pool.query(`
      UPDATE proyectos
      SET estado = 'Finalizado'
      WHERE id = $1
      RETURNING estado, fecha_fin;
    `, [proyectoId]);

    const proyecto = updateRes.rows[0];
    const hoy = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD

    expect(proyecto.estado).toBe("Finalizado");
    expect(proyecto.fecha_fin.toISOString().slice(0, 10)).toBe(hoy);
  });

  test("3️⃣ Intentar asignar manualmente una fecha_fin distinta debe lanzar error", async () => {
    const fechaInvalida = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // hace 2 días

    await expect(pool.query(`
      UPDATE proyectos
      SET estado = 'Cancelado', fecha_fin = $2
      WHERE id = $1;
    `, [proyectoId, fechaInvalida]))
      .rejects
      .toThrow(/No se puede asignar manualmente una fecha_fin/);
  });

  test("4️⃣ Si se cambia a 'En Progreso', la fecha_fin debe quedar NULL", async () => {
    const updateRes = await pool.query(`
      UPDATE proyectos
      SET estado = 'En Progreso'
      WHERE id = $1
      RETURNING estado, fecha_fin;
    `, [proyectoId]);

    const proyecto = updateRes.rows[0];

    expect(proyecto.estado).toBe("En Progreso");
    expect(proyecto.fecha_fin).toBeNull();
  });
});
