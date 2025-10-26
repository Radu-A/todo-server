const dummyUser = {
  id: 1,
  email: "test@example.com",
  password: "password-123",
  rol: "admin",
};

const checkLogin = (req, res) => {
  const { email, password } = req.body;
  if (email == dummyUser.email && password == dummyUser.password) {
    res.status(200).json({
      message: "User connected",
      user: { id: dummyUser.id, rol: dummyUser.rol },
    });
  } else {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }
};

export { checkLogin };
