/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class MetadvItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["metadv", "sheet", "item"],
      width: 520,
      height: 520,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/metadv/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

      // Ecoute sur l'utilisation d'une arme
      html.find('.useweapon').click((ev) => {
        const div = $(ev.currentTarget).parents(".item");
        const Arme = this.actor.items.get(div.data("itemId"));
        const NomArme = Arme.name;
        const Attribut = Arme.system.AttributAssocie;
        const ValeurDe = Object.getOwnPropertyDescriptor(this.actor, 'name');
        console.log(Attribut + " -" + NomArme+ " - "+ ValeurDe);
      
        //this.actor.rollWeapon(IntituleComp,NbDesCompetence)
      });




  }



}
