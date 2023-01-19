/* eslint-disable import/no-extraneous-dependencies */
const { expect } = require("chai");
const session = require("supertest-session");
const app = require("../../src/app.js");
const { Recipe, conn } = require("../../src/db.js");

const agent = session(app);

describe("--->  POST /recipe  <---", () => {
  beforeEach(() => Recipe.sync({ force: true }));

  it("should respond with 201", (done) =>{
    agent.post("/recipe").send({ name: "test", summary: "sum" }).expect(201);
    done()
  });

  it("should respond with created Recipe", () =>
    agent
      .post("/recipe")
      .send({ name: "test", summary: "sum" })
      .expect(201)
      .then((res) =>
        expect(res.body).to.have.include.keys("name", "id", "image")
      ));

  it("should respond with 422 and shouldnt POST if theres no name or summary", () =>
    agent
      .post("/recipe")
      .send({ name: "test" })
      .expect(422)
      .then((res) => {
        expect(res.text).to.be.equal(
          '{"message":"NAME and SUMMARY are required"}'
        );
      }));
  it("should respond with 422 and shouldnt POST if theres invalid score / healthScore", () =>
    agent
      .post("/recipe")
      .send({ name: "test", summary: "sum", healthScore: 200 })
      .expect(422)
      .then((res) => {
        expect(res.text).to.be.equal(
          '{"message":"HEALTHSCORE must be between 0-100"}'
        );
      }));

  it("if score/healtScore is undefined it should assing 0", () =>
    agent
      .post("/recipe")
      .send({ name: "test", summary: "sum" })
      .then((res) => {
        expect(res.body.healthScore).to.be.equal(0);
      }));
});
