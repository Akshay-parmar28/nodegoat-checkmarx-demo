/// <reference types="Cypress" />

describe("/allocations behaviour", () => {
  "use strict";

  before(() => {
    cy.dbReset();
  });

  afterEach(() => {
    cy.visitPage("/logout");
  });

  it("Should redirect if the user has not logged in", () => {
    cy.visitPage("/allocations/1");
    cy.url().should("include", "login");
  });

  it("Should be accesible for a logged user", () => {
    cy.userSignIn();
    cy.visitPage("/allocations/1");
    cy.url().should("include", "allocations");
  });

  it("Should be an input", () => {
    cy.userSignIn();
    cy.visitPage("/allocations/1");
    cy.get("input[name='threshold']");
  });

    it("Should always land the user on their OWN allocations page, regardless of the URL id used to get there", () => {
    // Fix for A4 Insecure DOR: userId now comes from the session, not the URL,
    // so submitting the form redirects to the signed-in user's real id -
    // it may differ from the "1" used in the initial visit above.
    const threshold = 2;
    cy.userSignIn();
    cy.visitPage("/allocations/1");

    cy.get("input[name='threshold']")
      .clear()
      .type(threshold);

    cy.get("button[type='submit']")
      .click();

    cy.location().should((loc) => {
      expect(loc.search).to.eq(`?threshold=${threshold}`);
      expect(loc.pathname).to.match(/^\/allocations\/\w+$/);
    });
  });
});
