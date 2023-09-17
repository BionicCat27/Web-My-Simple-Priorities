import { createUserWithEmailAndPassword, deleteUser, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import puppeteer from "puppeteer";
process.env.MODE = "development";
import {app, enableDevelopmentMode} from '../src/firebaseConfig';
enableDevelopmentMode();

describe("App", () => {
    let browser;
    let page;
    let auth;
    let baseUrl = "http://localhost:5000";
    let email = "logintestuser@testusers.com";
    let password = "testuser";

    beforeAll(async () => {
        expect(process.env.MODE).toBe("development");
    });

    beforeEach(async () => {
        browser = await puppeteer.launch({ headless: "new" });
        browser.createIncognitoBrowserContext();
        page = await browser.newPage();
    });

    it("logs user in successfully", async () => {
        await page.goto(baseUrl);
        expect(page.url()).toBe(`${baseUrl}/login`)
        await page.waitForSelector("#pageTitle");
        const text = await page.$eval("#pageTitle", (e) => e.textContent);
        expect(text).toContain("Login");
        await page.$('#loginForm');
        await page.type('#loginFormEmail', email);
        await page.type('#loginFormPassword', password);
        await page.click('#loginButton');
        await page.waitForSelector("#sidebarTitle");
        const sidebarTitle = await page.$eval("#sidebarTitle", (e) => e.textContent);
        expect(sidebarTitle).toContain("My SimplePriorities");
    });


    it("fails to login invalid user", async () => {
        await page.goto(baseUrl);
        expect(page.url()).toBe(`${baseUrl}/login`)
        await page.waitForSelector("#pageTitle");
        const pageTitle = await page.$eval("#pageTitle", (e) => e.textContent);
        expect(pageTitle).toBe("Login")
        await page.$('#loginForm');
        await page.type('#loginFormEmail', "abcd1234");
        await page.type('#loginFormPassword', "abcd1234");
        await page.click('#loginButton');
        await page.waitForSelector("#login-error-message");
        const loginErrorMessage = await page.$eval("#login-error-message", (e) => e.textContent);
        expect(loginErrorMessage).toBe("Incorrect username or password.")
    });

    afterEach(() => {
        page.close();
    });

    afterAll(() => {
        browser.close();
    });
});