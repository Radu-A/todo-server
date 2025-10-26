// authController.js

import bcrypt from "bcrypt";

const dummyUser = {
  id: 1,
  email: "test@example.com", // Usamos el HASH generado de "password123"
  password: '$2a$12$im3wfbo.IrHZvNEOpreeieOlW5TjCeF9892BI7YI/iTh2bU5YS4Ay',
  rol: "admin",
};

const checkLogin = async (req, res) => {
  // <-- ¡IMPORTANTE! Hacer la función asíncrona
  const { email, password } = req.body; // 1. Verificar si el email coincide (Paso de la Fase 1)
  if (email !== dummyUser.email) {
    // Devolvemos el mismo error para evitar dar pistas a atacantes
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  // 2. COMPARACIÓN ASÍNCRONA: Compara la contraseña de texto plano (password)
  //    con el hash almacenado (dummyUser.password).
  let isMatch;
  try {
    isMatch = await bcrypt.compare(password, dummyUser.password);
  } catch (error) {
    console.error("Error al comparar hashes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }

  if (isMatch) {
    // ÉXITO: Contraseña correcta
    return res.status(200).json({
      message: "User connected",
      user: { id: dummyUser.id, email: dummyUser.email, rol: dummyUser.rol },
    });
  } else {
    // FALLO: Contraseña incorrecta
    return res.status(401).json({ message: "Credenciales inválidas" });
  }
};

export { checkLogin };
