/* eslint-disable import/no-extraneous-dependencies */
const { expect } = require("chai");
const session = require("supertest-session");
const app = require("../../src/app.js");
const { Recipe, conn } = require("../../src/db.js");

const agent = session(app);
const recipe = {
  name: "Milanesa a la napolitana",
  summary: "summary",
};

describe("--->  GET /recipes?name=  <---", () => {
  before(() =>
    conn.authenticate().catch((err) => {
      console.error("Unable to connect to the database:", err);
    })
  );

  beforeEach(() =>
    Recipe.sync({ force: true }).then(() => Recipe.create(recipe))
  );

  it("should get 200", (done) => {
    agent.get("/recipes?name=milanesa").expect(200);
    done();
  });

  it("should return an JSON array of results", (done) => {
    agent
      .get("/recipes?name=cheese")
      .expect(200)
      .then((res) => {
        console.log(typeOf(res));
        expect(res.body).to.be.an("json");
        // expect(Array.isArray(res.body)).to.be.true;
      });
    done();
  });

  it("should return properties of diets", (done) => {
    agent.get("/recipes?name=cheese").then((res) => {
      expect(res.body[0]).to.have.all.keys(
        "name",
        "id",
        "healthScore",
        "image",
        "diets"
      );
    });
    done();
  });

  it("should return error message if theres no results", (done) => {
    agent
      .get("/recipes?name=mdasda")
      .expect(200)
      .then((res) => {
        expect(res.body).to.be.deep.equal({
          message: "Something goes wrong when calling with name param",
        });
      });
    done();
  });
});
