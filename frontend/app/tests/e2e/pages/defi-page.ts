import { Module } from '@/types/modules';

export class DefiPage {
  visit() {
    cy.get('.v-app-bar__nav-icon').click();
    cy.get('.navigation__defi').click();
    cy.get('.navigation__defi-overview').click();
  }

  goToSelectModules() {
    cy.get('.defi-wizard__select-modules').click();
  }

  selectModules() {
    const ignoredModules = [Module.YEARN, Module.MAKERDAO_DSR];
    const values = Object.values(Module).filter(
      module => !ignoredModules.includes(module)
    );

    for (const module of values) {
      if (module === Module.AAVE) {
        continue;
      }

      cy.get(`#defi-module-${module}`).scrollIntoView();
      cy.get(`#defi-module-${module}`).find('button').click();
      cy.get(`#defi-module-${module}`).should('not.exist');
    }
    cy.get(`#defi-module-${Module.AAVE}`).should('be.visible');
    cy.get('.defi-wizard__select-accounts').click();
  }

  selectAccounts() {
    cy.get('.module-address-selector')
      .find('.v-stepper__header')
      .children()
      .should('have.length', 1);
    cy.get('.defi-wizard__done').click();
  }

  defiOverviewIsVisible() {
    cy.contains('Defi Overview').should('be.visible');
  }
}
