/// <reference types="Cypress" />

describe("/learn behaviour", () => {
  "use strict";

  afterEach(() => {
    cy.visitPage("/logout");
  });

  it("Should redirect if the user has not logged in", () => {
    cy.visitPage("/learn?url=/dashboard");
    cy.url().should("include", "login");
  });

  it("Should be accesible for a logged user", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=/tutorial");
    cy.url().should("include", "tutorial");
  });

  it("Should reject redirects to unapproved destinations", () => {
    cy.userSignIn();
    cy.visitPage("/learn?url=/dashboard", { failOnStatusCode: false });
    cy.contains("Invalid redirect URL").should("be.visible");
  });
});
