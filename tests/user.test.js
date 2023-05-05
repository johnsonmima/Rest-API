const request = require("supertest");
const app = require("../src/app");
const {
  configureDatabase,
  userOne,
  userTwo,
  userThree,
  userFour,
  User,
} = require("./fixtures/db");

// clear data base
beforeAll(configureDatabase);

// Test Create New User
test("Create New User", async () => {
  const response = await request(app)
    .post("/users/signup")
    .send(userThree)
    .set("Accept", "application/json");

  expect(response.status).toBe(201);

  const { user, token } = response.body;
  expect(user.name).toBe(userThree.name);
  expect(token).toBeTruthy();

  // Assert that the user was saved in the database
  const assertUser = await User.findById(user._id);
  expect(assertUser).not.toBeNull();
  // Assert the response

  expect(response.body).toMatchObject({
    user: {
      name: userThree.name,
    },
    token: assertUser.tokens[0].token,
  });
});

// Test Create New User
test("Create User Four based on email & pwd", async () => {
  const response = await request(app)
    .post("/users/signup")
    .send(userFour)
    .set("Accept", "application/json");

  expect(response.status).toBe(201);

  const { user, token } = response.body;
  expect(user.name).toBe(userFour.name);
  expect(token).toBeTruthy();
});

// Log in existing user
test("Should Login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .set("Accept", "application/json")
    .send({ email: userOne.email, password: userOne.password });

  expect(response.status).toBe(200);
  const { user, token } = response.body;
  expect(user.name).toBe(userOne.name);
  expect(token).toBeTruthy();
});

// Login Failure
test("Login Failure", async () => {
  const response = await request(app)
    .post("/users/login")
    .set("Accept", "application/json")
    .send({ email: userOne.email, password: userFour.password });

  expect(response.status).toBe(400);
});

// Get user Profile
test("Should Get User Profile", async () => {
  const response = await request(app)
    .get("/users/me")
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send();
  expect(response.status).toBe(200);
});

// Should Not Get Profile
test("Should Not Get Profile For Unauthenticated User", async () => {
  const response = await request(app)
    .get("/users/me")
    .set("Accept", "application/json")
    .set("Authorization", "Bearer xgashshsdgdsgdg")
    .send();
  expect(response.status).toBe(401);
});

// Should Delete User Account with auth token
test("Should Delete User One Account", async () => {
  const response = await request(app)
    .delete(`/users/${userOne._id}`)
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send();
  expect(response.status).toBe(200);
});

// Should not delete User Two without an auth token
test("Should Not Delete User Two Account Without Auth", async () => {
  const response = await request(app)
    .delete(`/users/${userTwo._id}`)
    .set("Accept", "application/json")
    .set("Authorization", `Bearer xyz`)
    .send();
  expect(response.status).toBe(401);
});

// Should upload avatar image
test("Should upload avatar image for User Two", async () => {
  const response = await request(app)
    .post("/users/upload")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .attach("avatar", `tests/fixtures/github.jpg`);

  expect(response.status).toBe(200);
  // check binary data is saved
  const user = await User.findById(userTwo._id);
  // check if its a number
  expect(user.avatar).toEqual(expect.any(Buffer));
});

// update user field
test("Should Update User Two", async () => {
  const response = await request(app)
    .patch(`/users/${userTwo._id}`)
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({ name: "Mike Anna Can" });

  expect(response.status).toBe(200);
});
