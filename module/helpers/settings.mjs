export const registerSystemSettings = function() {

    const reload = foundry.utils.debounce(() => window.location.reload(), 250);
    game.settings.register("metadv", "moveItem", {
      name: "Type de transfert d'objet",
      hint: "Le drag&drop d'item entre fiches  (Hero, png, loot et vaisseaux) peut prendre la forme d'une copie de l'objet ou d'un déplacement de l'objet (il sera alors supprimé de la fiche source et copié vers la fiche destinatrice)",
      scope: "world",
      type: String,
      choices: {
          "0" : "Copie de l'objet",
          "1" : "Déplacement de l'objet"
      },
      default: "1",
      config: true
  });  
  }