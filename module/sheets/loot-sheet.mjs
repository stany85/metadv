/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MetadvLootSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["metadv", "sheet", "actor"],
      template: "systems/metadv/templates/actor/actor-loot-sheet.hbs",
      width: 400,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }
  get template() {
    return `systems/metadv/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }
  

  activateListeners(html){
    super.activateListeners(html);
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




  _prepareItems(context) {
    
    // Initialize containers.

    const armes =  [];
    const armures =  [];
    const objets =  [];


    // Boucle pour créer les containers objets de l'actor
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      // container Armes
      if (i.type === 'Arme') {
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

      }        


    // Assignation
    context.armes = armes;
    context.armures = armures;
    context.objets = objets;

  }
  async _onDropItem(event, data) {
    
    if (!this.actor.isOwner) return false;
  
    // Get the item from the drop
    const item = await Item.fromDropData(data);
    
    const itemData = item.toObject();
  
    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);
  
    // Create the owned item
    return this._onDropItemCreate(itemData, data.uuid, event.shiftKey);
  }
  
  
   _onDropItemCreate(itemData, source, shiftKey) {
    switch (itemData.type) {
      case "Mutation":
      case "Archetype":
      case "Origine":
      case "Trait":
      case "Motivation":
      return false;
      default: {
        const itemId = itemData._id;
  
        // Faut-il déplacer ou copier l'item ?
        let moveItem = game.settings.get("metadv", "moveItem");
        
        // Récupération de l'actor d'origine
        let originalActorID = null;
        let originalActor = null;
        if (source.includes("Actor")) {
          originalActorID = source.split(".")[1];
          originalActor = ActorDirectory.collection.get(originalActorID);
        }
  
        // Si l'item doit être déplacé ET qu'il n'est plus dans l'inventaire d'origine, affichage d'un message d'avertissement et on arrête le traitement
        if (moveItem && originalActor && !originalActor.items.get(itemData._id)) {
          ui.notifications.warn("L'objet n'est n'existe plus !");
          return null;
        }
       
        itemData = itemData instanceof Array ? itemData : [itemData];
        // Create the owned item
        return this.actor.createEmbeddedDocuments("Item", itemData).then((item) => {
          // Si il n'y as pas d'originalActor l'objet ne vient pas d'un autre acteur
         if (!originalActor) return item;
  
          // Si l'item doit être "move", on le supprime de l'actor précédent
          if (moveItem ^ shiftKey) {
           
            if (!originalActor.token) {
              originalActor.deleteEmbeddedDocuments("Item", [itemId]);
            } else {
              let token = TokenLayer.instance.placeables.find((token) => token.id === data.tokenId);
              let oldItem = token?.document.getEmbeddedCollection("Item").get(itemId);
              oldItem?.delete();
            }
          }
        });
      }
    }
  }

  async getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    this._prepareItems(context);
    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    return context;



  }
}
