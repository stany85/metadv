* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/

import { HawkmoonUtility } from "./hawkmoon-utility.js";
import { HawkmoonAutomation } from "./hawkmoon-automation.js";

/* -------------------------------------------- */
const __ALLOWED_ITEM_CELLULE = { "equipage": 1, "ressource": 1, "contact": 1}

/* -------------------------------------------- */
export class MetadvEquipageSheet extends ActorSheet {

 /** @override */
 static get defaultOptions() {

   return mergeObject(super.defaultOptions, {
     classes: ["fvtt-hawkmoon-cyd", "sheet", "actor"],
     template: "systems/fvtt-hawkmoon-cyd/templates/cellule-sheet.html",
     width: 640,
     height: 720,
     tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "talents" }],
     dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
     editScore: false
   });
 }

 /* -------------------------------------------- */
 async getData() {
   const objectData = duplicate(this.object)

   let formData = {
     title: this.title,
     id: objectData.id,
     type: objectData.type,
     img: objectData.img,
     name: objectData.name,
     editable: this.isEditable,
     cssClass: this.isEditable ? "editable" : "locked",
     system: objectData.system,
     effects: this.object.effects.map(e => foundry.utils.deepClone(e.data)),
     limited: this.object.limited,
     talents: duplicate(this.actor.getTalents() || {}),
     ressources: duplicate(this.actor.getRessources()),
     contacts: duplicate(this.actor.getContacts()),
     members: this.getMembers(),
     description: await TextEditor.enrichHTML(this.object.system.description, { async: true }),
     options: this.options,
     owner: this.document.isOwner,
     editScore: this.options.editScore,
     isGM: game.user.isGM
   }
   this.formData = formData;

   console.log("CELLULE : ", formData, this.object);
   return formData;
 }

 /* -------------------------------------------- */
 getMembers( ) {
   let membersFull = []
   for(let def of this.actor.system.members) {
     let actor = game.actors.get(def.id)
     membersFull.push( { name: actor.name, id: actor.id, img: actor.img } )
   }
   return membersFull
 }

 /* -------------------------------------------- */
 /** @override */
 activateListeners(html) {
   super.activateListeners(html);

   // Everything below here is only needed if the sheet is editable
   if (!this.options.editable) return;

   // Update Inventory Item
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
   
   // Update Inventory Item
   html.find('.item-edit').click(ev => {
     const li = $(ev.currentTarget).parents(".item")
     let itemId = li.data("item-id")
     const item = this.actor.items.get(itemId)
     item.sheet.render(true)
   })
   // Delete Inventory Item
   html.find('.item-delete').click(ev => {
     const li = $(ev.currentTarget).parents(".item");
     HawkmoonUtility.confirmDelete(this, li);
   })
   html.find('.edit-item-data').change(ev => {
     const li = $(ev.currentTarget).parents(".item")
     let itemId = li.data("item-id")
     let itemType = li.data("item-type")
     let itemField = $(ev.currentTarget).data("item-field")
     let dataType = $(ev.currentTarget).data("dtype")
     let value = ev.currentTarget.value
     this.actor.editItemField(itemId, itemType, itemField, dataType, value)
   })

   html.find('.quantity-minus').click(event => {
     const li = $(event.currentTarget).parents(".item");
     this.actor.incDecQuantity(li.data("item-id"), -1);
   });
   html.find('.quantity-plus').click(event => {
     const li = $(event.currentTarget).parents(".item");
     this.actor.incDecQuantity(li.data("item-id"), +1);
   });

   html.find('.lock-unlock-sheet').click((event) => {
     this.options.editScore = !this.options.editScore;
     this.render(true);
   });
 }

 /* -------------------------------------------- */
 async _onDropActor(event, dragData) {
   const actor = fromUuidSync(dragData.uuid)
   if (actor) { 
     this.actor.addMember(actor.id)
   } else {
     ui.notifications.warn("Cet acteur n'a pas été trouvé.")
   }
   super._onDropActor(event)
 }

 /* -------------------------------------------- */
 async _onDropItem(event, dragData) {
   let data = event.dataTransfer.getData('text/plain')
   let dataItem = JSON.parse(data)
   let item = fromUuidSync(dataItem.uuid)
   if (item.pack) {
     item = await HawkmoonUtility.searchItem(item)
   }
   if ( __ALLOWED_ITEM_CELLULE[item.type]) {
     super._onDropItem(event, dragData)
     return
   }
   ui.notifications("Ce type d'item n'est pas autorisé sur une Cellule.")
 }


 /* -------------------------------------------- */
 /** @override */
 setPosition(options = {}) {
   const position = super.setPosition(options);
   const sheetBody = this.element.find(".sheet-body");
   const bodyHeight = position.height - 192;
   sheetBody.css("height", bodyHeight);
   return position;
 }

}