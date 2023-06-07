import "./pre-start";
import supertest from "supertest";
import server from "@serv/server";
const agent = supertest(server);
export default agent;
