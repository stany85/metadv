
/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class MetadvActor extends Actor {

  constructor(...args) {
    let data = args[0];
    const METADV = {};
    //Par défaut, on attribue une image à une nouvelle entrée des acteurs
     METADV.IconeDefautActeur = {
      "hero": "systems/metadv/icones/portraits/hero.webp",
      "PNJ": "systems/metadv/icones/portraits/pnj.webp",
      "Vaisseau": "systems/metadv/icones/vaisseaux/defaut_icone.webp",
      "loot": "systems/metadv/icones/objets/loot.webp"
    };
    if (!data.img && METADV.IconeDefautActeur[data.type]) {
      data.img = METADV.IconeDefautActeur[data.type];
      if (!data.token) data.token = {};
      if (!data.token.img) data.token.img = METADV.IconeDefautActeur[data.type];
    }
    super(...args);
  }

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.metadv || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type == 'loot') return;
    if (actorData.type == 'Vaisseau') return;
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }
  async incDecQuantity(objetId, incDec = 0) {
    let objetQ = this.items.get(objetId)
    if (objetQ) {
      let newQ = objetQ.system.Quantite + incDec
      newQ = Math.max(newQ, 0)
      await this.updateEmbeddedDocuments('Item', [{ _id: objetQ.id, 'system.Quantite': newQ }]); // pdates one EmbeddedEntity
    }
  }
  addMember(actorId) {
    let members = duplicate(this.system.Membre)
    members.push({ id: actorId })
    this.update({ 'system.Membre': members })
  
  }
  async removeMember(actorId) {
    let members = this.system.Membre.filter(it => it.id != actorId)
    this.update({ 'system.Membre': members })
  }

  /**
   * Preparation spécifique des données du Hero
   */
  _prepareCharacterData(actorData) {
    if (actorData.type == 'vaisseau') return;
    if (actorData.type == 'loot') return;
    // Modification et calculs du Héro
    // Simplification d'appels
    const systemData = actorData.system;  

    //Calcul des points totaux compétences du joueur (hero)
    for (var nomDomaine in systemData.Domaine) { // Pour chaque propriété de data.data.Domaine, prendre le nom de la propriété
      var domaine = systemData.Domaine[nomDomaine]; // récupérer la valeur de la propriete de type domaine du domaine
      for (var nomCompetence in domaine.Competence) { // Pour chaque propriété de la propriété domaine, prendre le nom de la propriété
          var competence = domaine.Competence[nomCompetence]; // récupérer la valeur de la propriété de type competence
          var attribut = Number(systemData.Attribut[domaine.AttributAssocie]); // récupérer la valeur de l'attribut associé
          var base = competence.Valeur; // récupérer la valeur de la compétence          
          var bonus = Number(systemData.Bonus[domaine.AttributAssocie]); //Récupération du bonus du domaine associé à la compétence
          // On vérifie si la compétence est fermé
          if(competence.Ferme==1 && competence.Valeur==0){
            competence['total'] =0;
          }
          else{
          competence['total'] = base+bonus+attribut;   }
      }

      };
      // Calcul Points de vie
      systemData.CapitalVie = Number(systemData.Attribut.SangFroid)+Number(systemData.Attribut.Carrure);
      // Calcul Energie X
      systemData.EnergieX = Number(systemData.Attribut.Perception)+Number(systemData.Attribut.Intelligence)+Number(systemData.Bonus.EnergieX);      
      // Calcul du panache

  // Calcul des différentes initiatives
  // Combat entre personnage
  systemData.InitCombatPerso = Number(systemData.Domaine.Trempe.Competence.Tactique.Valeur)+Number(systemData.Attribut.SangFroid);
  // Combat spatial
  systemData.InitSpatial = Number(systemData.Domaine.Sciences.Competence.Navigation.Valeur)+Number(systemData.Attribut.Intelligence);
  // confrontation sociale
  systemData.InitSocial = Number(systemData.Domaine.Negociation.Competence.Etiquette.Valeur)+Number(systemData.Attribut.Presence);
  //Autre
  systemData.InitAutre= Number(systemData.Domaine.Espionnage.Competence.Vigilance.Valeur)+Number(systemData.Attribut.Perception);
  }

  /**
   *  Preparation spécifique des donénes du PNJ*/ 
  _prepareNpcData(actorData) {
    if (actorData.type !== 'PNJ') return;

    // calcul pour PNJ si besoin


  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'PNJ') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.

  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'PNJ') return;

    // Calcul de données des pnj si necessaire
  }
  //Affichage de la fenêtre de jets de dés
  async rollCompetence(IntituleComp,NbDesCompetence) {
    let fenDialog = await CompetenceDialog.create(this);
    fenDialog.render(true)
  }

}