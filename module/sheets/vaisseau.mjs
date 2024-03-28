/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
const __ALLOWED_ITEM_CELLULE = { "talent": 1, "ressource": 1, "contact": 1}

/* -------------------------------------------- */
export class MetadvVaisseau extends ActorSheet {

  /** @override */
  static get defaultOptions() {

    return mergeObject(super.defaultOptions, {
      classes: ["metadv", "sheet", "actor"],
      template: "systems/metadv/templates/actor/actor-Vaisseau-sheet.hbs",
      width: 640,
      height: 720,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
      editScore: false
    });
  }

  /* -------------------------------------------- */
  async getData() {
       
     
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();
   
    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Ajout de données faciles à rappeler
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.members = this.getMembers();
    context.capitaine = this.getCapitaine();
    context.officier = this.getOfficier();
    context.machinerie = this.getMachinerie();
    context.bosco = this.getBosco();
    context.vigie = this.getVigie();
    context.autremembre = this.getAutreMembre()
    context.pilote = this.getPilote()

    if (this.actor.system.Notes!=undefined){
      context.Notes = await TextEditor.enrichHTML(this.actor.system.Notes, {async: true})
    }
    if (this.actor.system.Description!=undefined){
      context.Description = await TextEditor.enrichHTML(this.actor.system.Description, {async: true})
    }
    //context.rollData = context.actor.getRollData();
    // Prepare données et  items

    if (actorData.type == 'Vaisseau') {
      this._prepareItems(context);
      this._calculPoidsTotal(context)
    }
    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();
  
    return context;
    
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */


  getMembers( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id)
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
    }
    return membersFull
  }

  getCapitaine( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id);
      if(actor.system.VaisseauRole=="Capitaine"){
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
      }
    }
    return membersFull
  }  

  getOfficier( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id);
      if(actor.system.VaisseauRole=="Officier"){
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
      }
    }
    return membersFull
  } 
  getBosco( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id);
      if(actor.system.VaisseauRole=="Bosco"){
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
      }
    }
    return membersFull
  } 
  getVigie( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id);
      if(actor.system.VaisseauRole=="Vigie"){
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
      }
    }
    return membersFull
  } 
  getMachinerie( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id);
      if(actor.system.VaisseauRole=="Machinerie"){
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
      }
    }
    return membersFull
  } 
  getAutreMembre( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id);
      if(actor.system.VaisseauRole=="-"){
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
      }
    }
    return membersFull
  } 
  getPilote( ) {
    let membersFull = []
    for(let def of this.actor.system.Membre) {
      let actor = game.actors.get(def.id);
      if(actor.system.VaisseauRole=="Pilote"){
      membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
      }
    }
    return membersFull
  } 
  async _onDropActor(event, dragData) {
    const actor = fromUuidSync(dragData.uuid)
    if (actor.type!="Vaisseau") { 
      this.actor.addMember(actor.id)
    } else {
      ui.notifications.warn("Un vaisseau ne peut être membre d'un autre vaisseau !")
    }
    super._onDropActor(event)
  }


  _prepareCharacterData(context) {
    // Handle ability scores.
    
  }
  _calculPoidsTotal(context) {
    var PoidsTotalObjet=0;
    for (let i of context.items) {
      if (i.type === 'Objet')
      { 
      console.log("i.type === Objet");
      PoidsTotalObjet = PoidsTotalObjet + i.system.Quantite*i.system.Encombrement;  
      }      
    }
    context.EncombrementTotal = PoidsTotalObjet;
  }
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    
    // Initialize containers.
    const aptitudes = [];
    const archetypes = [];
    const origines =  [];
    const mutations =  [];
    let armes =  [];
    const armures =  [];
    const objets =  [];
    const traits =  [];
    const motivations = [];
    const accessoires = [];

    // Boucle pour créer les containers objets de l'actor
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      // container Aptitude
      if (i.type === 'Aptitude') {
        aptitudes.push(i);
      }
      // container Archetype
      else if (i.type === 'Archetype') {
        archetypes.push(i);
      }
      // container Archetype
      else if (i.type === 'AccessoireVaisseau') {
        accessoires.push(i);
      }      
      // container origine
      else if (i.type === 'Origine') {
        origines.push(i);
      }
      // container Mutation
      else if (i.type === 'Mutation') {
        mutations.push(i);
      }
      // container Armes
      else if (i.type === 'Arme') {
        armes.push(i);
      }
      // container Armures
      else if (i.type === 'Armure') {
        armures.push(i);
      }
       // container Objets
       else if (i.type === 'Objet') {
        objets.push(i);
      }   
       // container Traits
       else if (i.type === 'Trait') {
        traits.push(i);
      } 
       // container Motivations
       else if (i.type === 'Motivation') {
        motivations.push(i);
      }        
      
    }

    // Assignation
    context.archetypes = archetypes;
    context.aptitudes = aptitudes;
    context.origines = origines;
    context.mutations = mutations;
    context.armes = armes;
    context.armures = armures;
    context.objets = objets;
    context.traits = traits;
    context.motivations = motivations;
    context.accessoires= accessoires;
  }


  activateListeners(html){
    super.activateListeners(html);

    // Gestion des membres
    html.find('.actor-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let actorId = li.data("actor-id")
      const actor = game.actors.get(actorId)
      actor.sheet.render(true)
    })
    html.find('.actor-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let actorId = li.data("actor-id")
      this.actor.removeMember(actorId)
    })
    // Edition d'objet
    html.find('.item-edit').click(ev => {
      const div = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(div.data("itemId"));
      item.sheet.render(true);
    });
    html.find('.quantity-modify').click(event => {
      const li = $(event.currentTarget).parents(".item")
      const value = Number($(event.currentTarget).data("quantite-value"))
      this.actor.incDecQuantity( li.data("item-id"), value );
    })
    // Ajout cargaison
    html.find('.item-create').click(this._onItemCreate.bind(this));
    // Suppression d'objet
    html.find('.item-delete').click(ev => {
      console.log("suppression");
      const div = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(div.data("itemId"));
      let d = Dialog.confirm({
        title : "Suppresion d'Objet",
        content:"<p>Confirmer la suppression de '"+ item.name +"'.</p>",
        yes:() =>  item.delete(),
        no:() => { },
        defaultYes: false
       });
    
    });
  }
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `Nouvel ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }
  // Calcul total de la soute
}