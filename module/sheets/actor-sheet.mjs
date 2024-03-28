import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {MetalFactor} from "../apps/metalfactor.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MetadvActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["metadv", "sheet", "actor"],
      template: "systems/metadv/templates/actor/actor-sheet.hbs",
      width: 580,
      height: 750,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  /** @override */
  get template() {
    return `systems/metadv/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {



    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    if (this.actor.system.Historique!=undefined){
      context.Historique = await TextEditor.enrichHTML(this.actor.system.Historique, {async: true})
    }


    // Prepare character data and items.
    if (actorData.type == 'hero') {
      this._prepareItems(context);
      this._prepareCharacterData(context);

    }

    // Prepare NPC data and items.
    if (actorData.type == 'PNJ') {
      this._prepareItems(context);
    }
    // Données spécifiques pour le vaisseau
    if (actorData.type == 'Vaisseau') {
      context.system = actorData.system;
      context.flags = actorData.flags;
      this._prepareItems(context);
      this._calculPoidsTotal(context);
      if (this.actor.system.Description!=undefined){
        context.Description = await TextEditor.enrichHTML(this.actor.system.Description, {async: true})
      }
    }
    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */





  _prepareCharacterData(context) {
    // Handle ability scores.
    
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */

  _calculPoidsTotal(context){
    const PoidsTotalObjet=0;
    for (let i of context.items) {
      if (i.type === 'Objet')
      { 
        console.log("i.type === Objet");
      PoidsTotalObjet = PoidsTotalObjet + i.system.Quantite*i.system.Encombrement;  
      }      
    }
    PoidsTotalObjet =2;
    context.EncombrementTotal = PoidsTotalObjet;
  }
  _prepareItems(context) {
    
    // Initialize containers.
    let aptitudes = [];
    let archetypes = [];
    let origines =  [];
    let mutations =  [];
    let armes =  [];
    let armures =  [];
    let objets =  [];
    let traits =  [];
    let motivations = [];
    let accessoires = [];

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
      // container Accesoire d evaisseau
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
    context.accessoires = accessoires;
  }


  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
        data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {return false;}
    if (!data) return false;
    if (data.type === "Item")  return this._onDropItem(event, data); 
    if (data.type === "Actor") return false; 
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


async _onDropItemCreate(itemData, source, shiftKey) {
  switch (itemData.type) {
    case "AccessoireVaisseau":
    ui.notifications.warn("Impossible d'insérer ce type d'objet");
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
  /* -------------------------------------------- */
  // Evenement lancer dés
    activateListeners(html){
      super.activateListeners(html);
      // Initiatives
      html.find('.JetInitMelee').click(this._onRollInitMelee.bind(this));
      html.find('.JetInitSocial').click(this._onRollInitSocial.bind(this));
      html.find('.JetInitSpatial').click(this._onRollInitSpatial.bind(this));
      html.find('.JetInitAutre').click(this._onRollInitAutre.bind(this));
      html.find('.JetCompetence').click(this._onRollComp.bind(this));
      html.find('.moinsBonus').click(this._onMoinsBonus.bind(this));
      html.find('.plusBonus').click(this._onPlusBonus.bind(this));
      html.find('.moinsMF').click(this._onMoinsMF.bind(this)); 
      html.find('.plusMF').click(this._onPlusMF.bind(this));
      html.find('.manuelMf').click(this._onMoinsMF.bind(this)); 

      html.find('.dif1').click(this._onNormal.bind(this));
      html.find('.dif2').click(this._onFacile.bind(this));
      html.find('.dif3').click(this._onDifficile.bind(this));

      html.find('.typeJetN').click(this._onJetNormal.bind(this));
      html.find('.typeJetE2F').click(this._onJetE2F.bind(this));
      html.find('.typeJetSC').click(this._onJetSC.bind(this));      
      html.find('.typeJetPMF').click(this._onJetPMF.bind(this));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const div = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(div.data("itemId"));
      item.sheet.render(true);
    });

    // Recherche de clique sur l'objet défini 'roll-competence'
    html.find('.roll-competence').click((event) => {
      const NbDesCompetence = event.target.dataset["dice"];
      var IntituleComp = event.target.dataset["dicecomp"];
      this.actor.rollCompetence(IntituleComp,NbDesCompetence)
    })
    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Ecoute sur l'utilisation d'une arme
    html.find('.useweapon').click((ev) => {
      const div = $(ev.currentTarget).parents(".item");
      const Arme = this.actor.items.get(div.data("itemId"));
      const NomArme = Arme.name;
      const Attribut = '"'+Arme.system.AttributAssocie+'"';
      const split = Attribut.split('.');
      split[0] = split[0].replace('"','');
      console.log(Attribut + " - "+NomArme+" - "+split[0]+ " - "+split[1]+ " - "+split[2]+ " - "+split[3]);
      console.log(this.actor);
      const ValeurDe = this.actor.system.Domaine[split[0]][split[1]][split[2]]["total"];
      console.log("Valeur : "+ValeurDe);  
      this._onRollArme(ValeurDe,NomArme);
    });



    // Delete Inventory Item
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
    
    html.find('.quantity-modify').click(event => {
      const li = $(event.currentTarget).parents(".item")
      const value = Number($(event.currentTarget).data("quantite-value"))
      this.actor.incDecQuantity( li.data("item-id"), value );
    })
    // Active Effect management
    //html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    //html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */

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

_plusMf(){
  ui.notifications.warn("test plus");
  console.log("test");
}
  _mfMoins(){
    ui.notifications.warn("test plus");
  }
// Changement difficultés dés
_onNormal(){
  let de = this.actor.system.JetDe;
  de = "n";
  this.actor.update({["system.JetDe"]: de});      
}
_onFacile(){
  let de = this.actor.system.JetDe;
  de = "tf";
  this.actor.update({["system.JetDe"]: de});      
}
_onDifficile(){
  let de = this.actor.system.JetDe;
  de = "td";
  this.actor.update({["system.JetDe"]: de});      
}
// Changement difficultés  des relances de dés 
_onJetNormal(){  
  let jet= "n";
  this.actor.update({["system.TypeJet"]: jet});       
}
_onJetE2F(){
  let jet="e2f";
  this.actor.update({["system.TypeJet"]: jet});       
}
_onJetSC(){
  let jet= "sc";
  this.actor.update({["system.TypeJet"]: jet});       
}
_onJetPMF(){
  let jet= "pmf";
  this.actor.update({["system.TypeJet"]: jet});       
}



  // Initiatives
  _onRollInitMelee(){
    CONFIG.Combat.initiative = {
      formula: this.actor.system.InitCombatPerso+"d6cs>3 +"+this.actor.system.InitCombatPerso+"/100",
      decimals: 0
    };
    let formula = this.actor.system.InitCombatPerso+"d6cs>3 +"+this.actor.system.InitCombatPerso+"/100";
    this.actor.rollInitiative(formula);


  }
  _onRollInitSpatial(){
    CONFIG.Combat.initiative = {
      formula: this.actor.system.InitSpatial+"d6cs>3 +"+this.actor.system.InitSpatial+"/100",
      decimals: 0
    };
    let formula = this.actor.system.InitSpatial+"d6cs>3 +"+this.actor.system.InitSpatial+"/100";
    this.actor.rollInitiative(formula);
  }
  _onRollInitSocial(){
    CONFIG.Combat.initiative = {
      formula: this.actor.system.InitSocial+"d6cs>3 +"+this.actor.system.InitSocial+"/100",
      decimals: 0
    };
    let formula = this.actor.system.InitSocial+"d6cs>3 +"+this.actor.system.InitSocial+"/100";
    this.actor.rollInitiative(formula);
  
  }
  _onRollInitAutre(){
    CONFIG.Combat.initiative = {
      formula: this.actor.system.InitAutre+"d6cs>3 +"+this.actor.system.InitAutre+"/100",
      decimals: 0
    };
    let formula = this.actor.system.InitAutre+"d6cs>3 +"+this.actor.system.InitAutre+"/100";
    this.actor.rollInitiative(formula);
  }

  _onPlusBonus(event)
  {
  let mf = this.actor.data.data.DesBonus;
  mf++;
  this.actor.update({["data.DesBonus"]: mf});    
  }
  _onMoinsBonus(event)
  {
  let mf = this.actor.data.data.DesBonus;
  mf--;
  this.actor.update({["data.DesBonus"]: mf}); 
   }

  // Suppression de dés MF
     _onMoinsMF(event)
     {
     let mf = this.actor.system.JetMf;
     if(mf>0){mf--;
     this.actor.update({["data.JetMf"]: mf});  
          }
      }

  // Ajout dés MF
   _onPlusMF(event)
     {     
     let mf = this.actor.system.JetMf;
     mf++;
     this.actor.update({["data.JetMf"]: mf});    
     }
  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
       // Suppression de dés MF

  /** Jet de dés des compétences */

  _onRollComp(event)
  {    
    const data = super.getData();
    const NbDes = event.target.dataset["dice"];
    var Intitule = event.target.dataset["dicecomp"];
    if (NbDes==""){return ui.notifications.warn('Compétence fermée : vous devez allouer des points pour utiliser la compétence "'+Intitule+'" !');}
    
    console.log(IntituleComp);
    const TypeJet = this.actor.system.TypeJet;
    const NbDesBonus = this.actor.system.DesBonus;
    var NbDesMf = this.actor.system.JetMf;
    var IntituleComp = "<div class='infoJetComp'>"+Intitule+" : "+NbDes+" dés</div><div class='saut'></div>";
    //On vérifie les dés bonus en y ajoutant l'ititulé
    if(NbDesBonus!=0)
        {
          var desb = "dé";
          if(NbDesBonus>1){desb ="dés";}
          if(NbDesBonus>0){IntituleComp += "<div class='chat-bonus'>+ "+NbDesBonus+ " "+desb+" bonus</div><div class='saut'></div> "; }
          else{IntituleComp += "<div class='chat-bonus'>"+NbDesBonus+ " "+desb+" bonus</div><div class='saut'></div>";}
         
        }
    // Récupération dés Metal Factor si utilisé     
    if(NbDesMf>0)
          {   
          var desmf = "dé";
          if(NbDesMf>1){desmf ="dés";}  
            if(NbDesMf>game.settings.get("metadv", "metaljoueur"))
              {
              // si dés MF suprieurs au pool dispo, le nb de dés MF est égal au reste des dés MF du Pool
              NbDesMf = game.settings.get("metadv", "metaljoueur"); 
              }  
          // On ajoute l'utilisation des dés dans le chat
          IntituleComp += "<div class='chat-mf'> + "+NbDesMf+" "+desmf +" MF !</div><div class='saut'></div>";
          }
        
    // On s'assure que le nombre de dés de la compétence est supérieur à 0
    if(event.target.dataset["dice"]>0)
        {                 
        
        // Type de dés utilisé
        const typeDe = "d6"
        
        // Calcul total dés utilisés (dés compétence + dés Metal Factor)
        const DesTotal = Number(NbDes)+Number(NbDesMf)+Number(NbDesBonus);
        const NbDesCompetence = DesTotal+typeDe;  
            // Jet normal 
            //var formula =roll.formula +  "cs>3" ;  
            var typejet ="";
            // Recherche du type de jets facile ou difficile
            // xo=6cs=6


          /////////////////////////////////////////////
          ////////  MODIFIEUR DE DES //////////////////
          /////////////////////////////////////////////
            // Jet normal et type normal
            if(this.actor.system.JetDe=="n" && TypeJet=="n")
                {
                var  formula = NbDesCompetence +   "cs>3";  
                var typejet ="";  
                }
            // Jet très facile et type normal   
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="n")
                {
                var  formula = NbDesCompetence +   "cs>1";  
                var typejet =" <div class='green'>Très facile</div><div class='saut'></div>";  
                }
            // Jet très difficile et type normal
            if(this.actor.system.JetDe=="td" &&  TypeJet=="n")
                {
                var  formula = NbDesCompetence +   "cs=6";    
                var typejet ="<div class='red'>Très difficile</div><div class='saut'></div>";
                }
            // Jet normal et type pmf
            if(this.actor.system.JetDe=="n" &&  TypeJet=="pmf")
                {
                var  formula = NbDesCompetence +   "xo>3cs>3";    
                var typejet ="";
                }               
            // Jet très facile et type pmf
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="pmf")
                {
                var  formula = NbDesCompetence +   "xo>1cs>1";    
                var typejet =" <div class='green'>Très facile</div><div class='saut'></div>";
                }   
            // Jet très difficile et type pmf           
            if(this.actor.system.JetDe=="td" &&  TypeJet=="pmf")
                {
                var  formula = NbDesCompetence +   "xo=6cs=6";    
                var typejet =" <div class='red'>Très difficile</div><div class='saut'></div>";
                }  
            // Jet normal et type seconde chance
            if(this.actor.system.JetDe=="n" &&  TypeJet=="sc")
                {
                var  formula = NbDesCompetence +   "xo<=3cs>3";    
                var typejet ="";
                }               
            // Jet très facile et type seconde chance
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="sc")
                {
                var  formula = NbDesCompetence +   "xo=1cs>1";    
                var typejet =" <div class='green'>Très facile</div><div class='saut'></div>";
                }   
            // Jet très difficile et type seconde chance          
            if(this.actor.system.JetDe=="td" &&  TypeJet=="sc")
                {
                var  formula = NbDesCompetence +   "xo<6cs=6";    
                var typejet =" <div class='red'>Très difficile</div><div class='saut'></div>";
                }  
            // Jet normal et type essaie encore une fois
            if(this.actor.system.JetDe=="n" &&  TypeJet=="e2f")
                {
                var formula = NbDesCompetence + "r>3cs>3";    
                var typejet ="";
                }               
            // Jet très facile et type essaie encore une fois
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="e2f")
                {
                var  formula = NbDesCompetence +   "r>1cs>1";    
                var typejet =" <div class='green'>Très facile</div><div class='saut'></div>";
                }   
            // Jet très difficile et type essaie encore une fois        
            if(this.actor.system.JetDe=="td" &&  TypeJet=="e2f")
                {
                var  formula = NbDesCompetence +   "r=6cs=6";    
                var typejet =" <div class='red'>Très difficile</div><div class='saut'></div>";
                }                  
                
          // Lancement du jet de dés
          var InfoJet="";
          if(TypeJet=="sc")
                {
                InfoJet = "<div class='infojet'>SECONDE CHANCE</div><div class='saut'></div>";  
                }
          if(TypeJet=="pmf")
                {
                InfoJet = "<div class='infojet'>PEUT MIEUX FAIRE</div><div class='saut'></div>";  
                }
          if(TypeJet=="e2f")
                {
                InfoJet = "<div class='infojet'>ESSAIE ENCORE UNE FOIS</div><div class='saut'></div>";  
                }
            var TexteResultDe2 = IntituleComp+typejet+InfoJet;
           
            let roll = new Roll(formula, this.actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: TexteResultDe2,
                rollMode: game.settings.get('core', 'rollMode'),
                });
        // Réinitialisation des données de jet facile, difficile, relance(spécial) et Metal Factor après le lancer de dés
        this.actor.update({["system.JetMf"]: 0});
        this.actor.update({["system.DesBonus"]: 0});
        this.actor.update({["system.DeSpecial"]: 0});
        this.actor.update({["system.JetDe"]: "n"}); 
        this.actor.update({["system.TypeJet"]: "n"}); 
        // Mise à jour du pool de dés MF
        if(this.actor.type=="PNJ")
        {
          if(this.actor.system.Mutant==false && NbDesMf>0 ){
            NbDesMf=NbDesMf-1;}
        var nouveaupointsMF = game.settings.get("metadv", "metaljoueur")+ NbDesMf;
        var nouveaupointsMFmj = 50 - nouveaupointsMF;
        }
        else{// PNJ
          if(this.actor.system.Mutant==false && NbDesMf>0 ){
            NbDesMf=NbDesMf-1;
            }
        var nouveaupointsMF = game.settings.get("metadv", "metaljoueur")- NbDesMf;
        var nouveaupointsMFmj = 50 - nouveaupointsMF;
        }
        game.settings.set("metadv", "metaljoueur",nouveaupointsMF) ;
        game.settings.set("metadv", "metalmj",nouveaupointsMFmj) ;

        return roll;        
        }
      else{ui.notifications.warn("Vous n'avez pas de points dans cette compétence");}

       
  }

  _onRollArme(NbDes,Intitule)
  {    
    const data = super.getData();
 
    if (NbDes==0){return ui.notifications.warn("Compétence fermée : vous devez allouer des points dans la compétence associée à l'arme "+Intitule+" !");}
    
    console.log(IntituleComp);
    const TypeJet = this.actor.system.TypeJet;
    const NbDesBonus = this.actor.system.DesBonus;
    var NbDesMf = this.actor.system.JetMf;
    var IntituleComp = "<div class='infoJetComp'>"+Intitule+" : "+NbDes+" dés</div><div class='saut'></div>";
    //On vérifie les dés bonus en y ajoutant l'ititulé
    if(NbDesBonus!=0)
        {
          var desb = "dé";
          if(NbDesBonus>1){desb ="dés";}
          if(NbDesBonus>0){IntituleComp += "<div class='chat-bonus'>+ "+NbDesBonus+ " "+desb+" bonus</div><div class='saut'></div>"; }
          else{IntituleComp += "<div class='chat-bonus'>"+NbDesBonus+ " "+desb+" bonus</div><div class='saut'></div>";}
         
        }
    // Récupération dés Metal Factor si utilisé     
    if(NbDesMf>0)
          {   
          var desmf = "dé";
          if(NbDesMf>1){desmf ="dés";}  
            if(NbDesMf>game.settings.get("metadv", "metaljoueur"))
              {
              // si dés MF suprieurs au pool dispo, le nb de dés MF est égal au reste des dés MF du Pool
              NbDesMf = game.settings.get("metadv", "metaljoueur"); 
              }  
          // On ajoute l'utilisation des dés dans le chat
          IntituleComp += "<div class='chat-mf'> + "+NbDesMf+" "+desmf +" MF !</div>";
          }
        
    // On s'assure que le nombre de dés de la compétence est supérieur à 0
    if(NbDes>0)
        {                 
        
        // Type de dés utilisé
        const typeDe = "d6"
        
        // Calcul total dés utilisés (dés compétence + dés Metal Factor)
        const DesTotal = Number(NbDes)+Number(NbDesMf)+Number(NbDesBonus);
        const NbDesCompetence = DesTotal+typeDe;  
            // Jet normal 
            //var formula =roll.formula +  "cs>3" ;  
            var typejet ="";
            // Recherche du type de jets facile ou difficile
            // xo=6cs=6


          /////////////////////////////////////////////
          ////////  MODIFIEUR DE DES //////////////////
          /////////////////////////////////////////////
            // Jet normal et type normal
            if(this.actor.system.JetDe=="n" && TypeJet=="n")
                {
                var  formula = NbDesCompetence +   "cs>3";  
                var typejet ="";  
                }
            // Jet très facile et type normal   
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="n")
                {
                var  formula = NbDesCompetence +   "cs>1";  
                var typejet =" <div class='green'>Très facile</div><div class='saut'></div>";  
                }
            // Jet très difficile et type normal
            if(this.actor.system.JetDe=="td" &&  TypeJet=="n")
                {
                var  formula = NbDesCompetence +   "cs=6";    
                var typejet ="<div class='red'>Très difficile</div><div class='saut'></div>";
                }
            // Jet normal et type pmf
            if(this.actor.system.JetDe=="n" &&  TypeJet=="pmf")
                {
                var  formula = NbDesCompetence +   "xo>3cs>3";    
                var typejet ="";
                }               
            // Jet très facile et type pmf
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="pmf")
                {
                var  formula = NbDesCompetence +   "xo>1cs>1";    
                var typejet =" <div class='green'>Très facile</div><div class='saut'></div>";
                }   
            // Jet très difficile et type pmf           
            if(this.actor.system.JetDe=="td" &&  TypeJet=="pmf")
                {
                var  formula = NbDesCompetence +   "xo=6cs=6";    
                var typejet =" <div class='red'>Très difficile</div><div class='saut'></div>";
                }  
            // Jet normal et type seconde chance
            if(this.actor.system.JetDe=="n" &&  TypeJet=="sc")
                {
                var  formula = NbDesCompetence +   "xo<=3cs>3";    
                var typejet ="";
                }               
            // Jet très facile et type seconde chance
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="sc")
                {
                var  formula = NbDesCompetence +   "xo=1cs>1";    
                var typejet =" <div class='green'>Très facile</div><div class='saut'></div>";
                }   
            // Jet très difficile et type seconde chance          
            if(this.actor.system.JetDe=="td" &&  TypeJet=="sc")
                {
                var  formula = NbDesCompetence +   "xo<6cs=6";    
                var typejet =" <div class='red'>Très difficile</div><div class='saut'></div>";
                }  
            // Jet normal et type essaie encore une fois
            if(this.actor.system.JetDe=="n" &&  TypeJet=="e2f")
                {
                var formula = NbDesCompetence + "r>3cs>3";    
                var typejet ="";
                }               
            // Jet très facile et type essaie encore une fois
            if(this.actor.system.JetDe=="tf" &&  TypeJet=="e2f")
                {
                var  formula = NbDesCompetence +   "r>1cs>1";    
                var typejet =" <div class='green'>Très facile</div>";
                }   
            // Jet très difficile et type essaie encore une fois        
            if(this.actor.system.JetDe=="td" &&  TypeJet=="e2f")
                {
                var  formula = NbDesCompetence +   "r=6cs=6";    
                var typejet =" <div class='red'>Très difficile</div><div class='saut'></div>";
                }                  
                
          // Lancement du jet de dés
          var InfoJet="";
          if(TypeJet=="sc")
                {
                InfoJet = "<div class='infojet'>SECONDE CHANCE</div><div class='saut'></div>";  
                }
          if(TypeJet=="pmf")
                {
                InfoJet = "<div class='infojet'>PEUT MIEUX FAIRE</div><div class='saut'></div>";  
                }
          if(TypeJet=="e2f")
                {
                InfoJet = "<div class='infojet'>ESSAIE ENCORE UNE FOIS</div><div class='saut'></div>";  
                }
            var TexteResultDe2 = IntituleComp+typejet+InfoJet;
           
            let roll = new Roll(formula, this.actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: TexteResultDe2,
                rollMode: game.settings.get('core', 'rollMode'),
                });
        // Réinitialisation des données de jet facile, difficile, relance(spécial) et Metal Factor après le lancer de dés
        this.actor.update({["system.JetMf"]: 0});
        this.actor.update({["system.DesBonus"]: 0});
        this.actor.update({["system.DeSpecial"]: 0});
        this.actor.update({["system.JetDe"]: "n"}); 
        this.actor.update({["system.TypeJet"]: "n"}); 
        // Mise à jour du pool de dés MF
        if(this.actor.type=="PNJ")
        {
          if(this.actor.system.Mutant==false && NbDesMf>0 ){
            NbDesMf=NbDesMf-1;}
        var nouveaupointsMF = game.settings.get("metadv", "metaljoueur")+ NbDesMf;
        var nouveaupointsMFmj = 50 - nouveaupointsMF;
        }
        else{// PNJ
          if(this.actor.system.Mutant==false && NbDesMf>0 ){
            NbDesMf=NbDesMf-1;
            }
        var nouveaupointsMF = game.settings.get("metadv", "metaljoueur")- NbDesMf;
        var nouveaupointsMFmj = 50 - nouveaupointsMF;
        }
        game.settings.set("metadv", "metaljoueur",nouveaupointsMF) ;
        game.settings.set("metadv", "metalmj",nouveaupointsMFmj) ;

        return roll;        
        }
      else{ui.notifications.warn("Vous n'avez pas de points dans la compétence associé à "+Intitule+"");}

       
  }
}
