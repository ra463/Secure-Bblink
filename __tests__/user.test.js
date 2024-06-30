const request = require("supertest");
const app = require("../app.js");

describe("Regiter API", () => {
  it("should register a new user with a strong password (lowercase email)", async () => {
    const userData = {
      name: "Test User",
      email: "testuser@example.com", // Lowercase email
      password: "P@ssw0rd123!", // Strong password
      confirmPassword: "P@ssw0rd123!",
    };

    const res = await request(app).post("/api/user/register").send(userData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "User Registered Successfully");
  });

  it("should fail to register with a weak password", async () => {
    const userData = {
      name: "Test User",
      email: "testuser2@example.com",
      password: "weakpassword", // Weak password
      confirmPassword: "weakpassword",
    };

    const res = await request(app).post("/api/user/register").send(userData);

    expect(res.statusCode).toEqual(400); // Expect bad request
    expect(res.body).toHaveProperty("message", "Password must be strong");
  });

  it("should fail to register with non-matching passwords", async () => {
    const userData = {
      name: "Test User",
      email: "testuser3@example.com",
      password: "password123",
      confirmPassword: "differentpassword",
    };

    const res = await request(app).post("/api/user/register").send(userData);

    expect(res.statusCode).toEqual(400); // Expect bad request
    expect(res.body).toHaveProperty(
      "message",
      "Confirm Password does not match"
    );
  });
});

describe("Login API", () => {
  it("should login a user with correct credentials", async () => {
    const userData = {
      email: "testuser@example.com",
      password: "P@ssw0rd123!",
    };

    const res = await request(app).post("/api/user/login").send(userData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Login Successful");
  });

  it("should fail to login with incorrect credentials", async () => {
    const userData = {
      email: "testuser@example.com",
      password: "wrongpassword",
    };

    const res = await request(app).post("/api/user/login").send(userData);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Invalid Credentials");
  });
});
