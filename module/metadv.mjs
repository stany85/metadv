game.metadv = {};
// Import document classes.
import { MetalFactor} from "./apps/metalfactor.js"
import { MetadvActor } from "./documents/actor.mjs";

import { MetadvPNJ } from "./sheets/pnj.mjs";
import { MetadvVaisseau } from "./sheets/vaisseau.mjs";
import { MetadvActorSheet } from "./sheets/actor-sheet.mjs";
import { MetadvLootSheet } from "./sheets/loot-sheet.mjs";
import { MetadvItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { METADV} from "./helpers/config.mjs";
import { registerSystemSettings } from "./helpers/settings.mjs";
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {
    registerSystemSettings();
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.metadv = {
    MetadvActor,
    MetadvItemSheet,
    MetalFactor,
    rollItemMacro
  };
  game.metadv.MetalFactor = MetalFactor;
  // Add custom constants for configuration.
  CONFIG.METADV = METADV;

  // Paramétrage base de l'initiative
  CONFIG.Combat.initiative = {
    formula: "3d6cs>3",
    decimals: 0
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */

  // Define custom Document classes
  CONFIG.Actor.documentClass = MetadvActor;
  //CONFIG.Item.documentClass = MetadvItemSheet;


  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("metadv", MetadvActorSheet, { types: ["hero"], makeDefault: true })
  Actors.registerSheet("metadv", MetadvPNJ, { types: ["PNJ"], makeDefault: true })
  Actors.registerSheet("metadv", MetadvVaisseau, { types: ["Vaisseau"], makeDefault: true });
  Actors.registerSheet("metadv", MetadvLootSheet, { types: ["loot"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("metadv", MetadvItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
 
});

/* -------------------------------------------- */
/*  Déclaration des helpers                     */
/* -------------------------------------------- */
// Affichage points selon ompétence fermé ou pas
Handlebars.registerHelper('Ferme', function (val) { 
    if(val==""){
    return "class='JetCompetence'>"+val+"";
    }
    else {
    return "class='AlerteFerme'>"+val+"";
    }

});

    // Gestion munition des armes
    Handlebars.registerHelper('Munition', function (n,MUN) { 
        var checked=""; 
        var nom =""; 
        if(n>0)
        {
        var entete ='<div class="munition">Munition ';
        var fin ='</div>';
        for (var i = 1; i <= n; i++)        
            {
                if(i==1){if(MUN.mun1){checked="checked";}else{checked="";}}
                if(i==2){if(MUN.mun2){checked="checked";}else{checked="";}}
                if(i==3){if(MUN.mun3){checked="checked";}else{checked="";}}
                if(i==4){if(MUN.mun4){checked="checked";}else{checked="";}}
                if(i==5){if(MUN.mun5){checked="checked";}else{checked="";}}
                if(i==6){if(MUN.mun6){checked="checked";}else{checked="";}}
                if(i==7){if(MUN.mun7){checked="checked";}else{checked="";}}
                if(i==8){if(MUN.mun8){checked="checked";}else{checked="";}}
                if(i==9){if(MUN.mun9){checked="checked";}else{checked="";}}
                if(i==10){if(MUN.mun10){checked="checked";}else{checked="";}}
                if(i==11){if(MUN.mun11){checked="checked";}else{checked="";}}
                if(i==12){if(MUN.mun12){checked="checked";}else{checked="";}}            
            nom += '<input class="caseMunition" type="checkbox" id="CheckboxMin" name="item.data.Munition.mun'+i+'" '+checked+'>';
            }
        return entete+nom+fin;
        }
    }); 

    Handlebars.registerHelper('VieIndemne', function (n,ind) { 
      var nom ="";
      var afficher="Pdv"+i;
      var checked="";       
      for (var i = 1; i <= n; i++)        
          {
              if(i==1){if(ind.Pdv1){checked="checked";}else{checked="";}}
              if(i==2){if(ind.Pdv2){checked="checked";}else{checked="";}}
              if(i==3){if(ind.Pdv3){checked="checked";}else{checked="";}}
              if(i==4){if(ind.Pdv4){checked="checked";}else{checked="";}}
              if(i==5){if(ind.Pdv5){checked="checked";}else{checked="";}}
              if(i==6){if(ind.Pdv6){checked="checked";}else{checked="";}}
              if(i==7){if(ind.Pdv7){checked="checked";}else{checked="";}}
              if(i==8){if(ind.Pdv8){checked="checked";}else{checked="";}}
              if(i==9){if(ind.Pdv9){checked="checked";}else{checked="";}}
              if(i==10){if(ind.Pdv10){checked="checked";}else{checked="";}}
              if(i==11){if(ind.Pdv11){checked="checked";}else{checked="";}}
              if(i==12){if(ind.Pdv12){checked="checked";}else{checked="";}}            
          nom += '<input class="casevie" type="checkbox" id="CheckboxMin" name="system.Indemne.Pdv'+i+'" '+checked+'>';
          }
      return nom;
  });
  // Modification manuel des points MF (pour MJ)
  Handlebars.registerHelper('ManuelMf',function (){
    var input="";
    if (game.user.isGM){
        input ='<div><a class="mfMoins"><i class="fa-solid fa-square-minus"></i></a>  Ajuster points  <a class="mfPlus"><i class="fa-solid fa-square-plus"></i></a></div>';
        return input;
    }
   
  })
  Handlebars.registerHelper('VieLeger', function (n,ind) { 
      var nom ="";
      var afficher="Pdv"+i;
      var checked="";       
      for (var i = 1; i <= n; i++)        
          {
              if(i==1){if(ind.Pdv1){checked="checked";}else{checked="";}}
              if(i==2){if(ind.Pdv2){checked="checked";}else{checked="";}}
              if(i==3){if(ind.Pdv3){checked="checked";}else{checked="";}}
              if(i==4){if(ind.Pdv4){checked="checked";}else{checked="";}}
              if(i==5){if(ind.Pdv5){checked="checked";}else{checked="";}}
              if(i==6){if(ind.Pdv6){checked="checked";}else{checked="";}}
              if(i==7){if(ind.Pdv7){checked="checked";}else{checked="";}}
              if(i==8){if(ind.Pdv8){checked="checked";}else{checked="";}}
              if(i==9){if(ind.Pdv9){checked="checked";}else{checked="";}}
              if(i==10){if(ind.Pdv10){checked="checked";}else{checked="";}}
              if(i==11){if(ind.Pdv11){checked="checked";}else{checked="";}}
              if(i==12){if(ind.Pdv12){checked="checked";}else{checked="";}}            
          nom += '<input type="checkbox" id="CheckboxMin" name="system.Leger.Pdv'+i+'" '+checked+'>';
          }
      return nom;
  });
//Calculer le poids d'un objet avec sa quantité
  Handlebars.registerHelper('Encombrement', function (quantite,poids) {
    var encombrement = quantite*poids;
    return encombrement;
  });
  Handlebars.registerHelper('VieGrave', function (n,ind) { 
      var nom ="";
      var afficher="Pdv"+i;
      var checked="";       
      for (var i = 1; i <= n; i++)        
          {
              if(i==1){if(ind.Pdv1){checked="checked";}else{checked="";}}
              if(i==2){if(ind.Pdv2){checked="checked";}else{checked="";}}
              if(i==3){if(ind.Pdv3){checked="checked";}else{checked="";}}
              if(i==4){if(ind.Pdv4){checked="checked";}else{checked="";}}
              if(i==5){if(ind.Pdv5){checked="checked";}else{checked="";}}
              if(i==6){if(ind.Pdv6){checked="checked";}else{checked="";}}
              if(i==7){if(ind.Pdv7){checked="checked";}else{checked="";}}
              if(i==8){if(ind.Pdv8){checked="checked";}else{checked="";}}
              if(i==9){if(ind.Pdv9){checked="checked";}else{checked="";}}
              if(i==10){if(ind.Pdv10){checked="checked";}else{checked="";}}
              if(i==11){if(ind.Pdv11){checked="checked";}else{checked="";}}
              if(i==12){if(ind.Pdv12){checked="checked";}else{checked="";}}            
          nom += '<input type="checkbox" id="CheckboxMin" name="system.Grave.Pdv'+i+'" '+checked+'>';
          }
      return nom;
  });

  Handlebars.registerHelper('VieMort', function (n,ind) { 
      var nom ="";
      var checked="";       
      for (var i = 1; i <= n; i++)        
          {
              if(i==1){if(ind.Pdv1){checked="checked";}else{checked="";}}
              if(i==2){if(ind.Pdv2){checked="checked";}else{checked="";}}
              if(i==3){if(ind.Pdv3){checked="checked";}else{checked="";}}
              if(i==4){if(ind.Pdv4){checked="checked";}else{checked="";}}
              if(i==5){if(ind.Pdv5){checked="checked";}else{checked="";}}
              if(i==6){if(ind.Pdv6){checked="checked";}else{checked="";}}
              if(i==7){if(ind.Pdv7){checked="checked";}else{checked="";}}
              if(i==8){if(ind.Pdv8){checked="checked";}else{checked="";}}
              if(i==9){if(ind.Pdv9){checked="checked";}else{checked="";}}
              if(i==10){if(ind.Pdv10){checked="checked";}else{checked="";}}
              if(i==11){if(ind.Pdv11){checked="checked";}else{checked="";}}
              if(i==12){if(ind.Pdv12){checked="checked";}else{checked="";}}            
          nom += '<input type="checkbox" id="CheckboxMin" name="system.Mort.Pdv'+i+'" '+checked+'>';
          }
      return nom;
  });   


 

  Handlebars.registerHelper('Pana', function (n,Pa) { 
      var nom ="";
      var checked=""; 
          
      for (var i = 1; i <= n; i++)        
          {
              if(i==1){if(Pa.pan1){checked="checked";}else{checked="";}}
              if(i==2){if(Pa.pan2){checked="checked";}else{checked="";}}
              if(i==3){if(Pa.pan3){checked="checked";}else{checked="";}}
              if(i==4){if(Pa.pan4){checked="checked";}else{checked="";}}
              if(i==5){if(Pa.pan5){checked="checked";}else{checked="";}}
              if(i==6){if(Pa.pan6){checked="checked";}else{checked="";}}
              if(i==7){if(Pa.pan7){checked="checked";}else{checked="";}}           
          nom += '<input type="checkbox" id="CheckboxMin" name="system.Pan.pan'+i+'" '+checked+'>';
          }
      return nom;

  });  

// Role dans le vaisseau
Handlebars.registerHelper('CheckCapitaine', function (val) {
    if(val=="Capitaine") return "selected";
    });
    Handlebars.registerHelper('CheckVide', function (val) {
    if(val=="-") return "selected";
    });
    Handlebars.registerHelper('CheckOfficier', function (val) {
    if(val=="Officier") return "selected";
        });
    Handlebars.registerHelper('CheckVigie', function (val) {
    if(val=="Vigie") return "selected";
    });
    Handlebars.registerHelper('CheckMachinerie', function (val) {
    if(val=="Machinerie") return "selected";
    });
    Handlebars.registerHelper('CheckBosco', function (val) {
    if(val=="Bosco") return "selected";
    })
    Handlebars.registerHelper('CheckPilote', function (val) {
    if(val=="Pilote") return "selected";
    })
// RADIX
Handlebars.registerHelper('Radix500', function (ind,n) { 
    var nom ="";
    var checked="";       
    for (var i = 1; i <= n; i++)        
        {
            if(i==1){if(ind.rad500-1){checked="checked";}else{checked="";}}
            if(i==2){if(ind.rad500-2){checked="checked";}else{checked="";}}
            if(i==3){if(ind.rad500-3){checked="checked";}else{checked="";}}
            if(i==4){if(ind.rad500-4){checked="checked";}else{checked="";}}
            if(i==5){if(ind.rad500-5){checked="checked";}else{checked="";}}
            if(i==6){if(ind.rad500-6){checked="checked";}else{checked="";}}
            if(i==7){if(ind.rad500-7){checked="checked";}else{checked="";}}
            if(i==8){if(ind.rad500-8){checked="checked";}else{checked="";}}
            if(i==9){if(ind.rad500-9){checked="checked";}else{checked="";}}
            if(i==10){if(ind.rad500-10){checked="checked";}else{checked="";}}
            if(i==11){if(ind.rad500-11){checked="checked";}else{checked="";}}
            if(i==12){if(ind.rad500-12){checked="checked";}else{checked="";}} 
            if(i==13){if(ind.rad500-13){checked="checked";}else{checked="";}}    
            if(i==14){if(ind.rad500-14){checked="checked";}else{checked="";}}    
            if(i==15){if(ind.rad500-15){checked="checked";}else{checked="";}}    
            if(i==16){if(ind.rad500-16){checked="checked";}else{checked="";}}    
            if(i==17){if(ind.rad500-17){checked="checked";}else{checked="";}}    
            if(i==18){if(ind.rad500-18){checked="checked";}else{checked="";}}               
        nom += '<input type="checkbox" id="CheckboxMin" name="data.Radix500.rad500-'+i+'" '+checked+'>';
        }
    return nom;
});   
Handlebars.registerHelper('Radix100', function (ind,n) { 
    var nom ="";
    var checked="";       
    for (var i = 1; i <= n; i++)        
        {
            if(i==1){if(ind.rad00-1){checked="checked";}else{checked="";}}
            if(i==2){if(ind.rad00-2){checked="checked";}else{checked="";}}
            if(i==3){if(ind.rad100-3){checked="checked";}else{checked="";}}
            if(i==4){if(ind.rad100-4){checked="checked";}else{checked="";}}
            if(i==5){if(ind.rad100-5){checked="checked";}else{checked="";}}
            if(i==6){if(ind.rad100-6){checked="checked";}else{checked="";}}
            if(i==7){if(ind.rad100-7){checked="checked";}else{checked="";}}
            if(i==8){if(ind.rad100-8){checked="checked";}else{checked="";}}
            if(i==9){if(ind.rad100-9){checked="checked";}else{checked="";}}
            if(i==10){if(ind.rad100-10){checked="checked";}else{checked="";}}
            if(i==11){if(ind.rad100-11){checked="checked";}else{checked="";}}
            if(i==12){if(ind.rad100-12){checked="checked";}else{checked="";}} 
            if(i==13){if(ind.rad100-13){checked="checked";}else{checked="";}}    
            if(i==14){if(ind.rad100-14){checked="checked";}else{checked="";}}    
            if(i==15){if(ind.rad100-15){checked="checked";}else{checked="";}}    
            if(i==16){if(ind.rad100-16){checked="checked";}else{checked="";}}    
            if(i==17){if(ind.rad100-17){checked="checked";}else{checked="";}}    
            if(i==18){if(ind.rad100-18){checked="checked";}else{checked="";}}               
        nom += '<input type="checkbox" id="CheckboxMin" name="data.Radix500.rad100-'+i+'" '+checked+'>';
        }
    return nom;
});  

    // Affichage des membres selon leur rôle
Handlebars.registerHelper('RoleMembre', function (val) {
        if(val=="-") 
        return "selected";
      });

  Handlebars.registerHelper('CheckAttAssPoing', function (val) {
    if(val=="Technique.Competence.ArmesPoing.total") return "selected";
  });
  Handlebars.registerHelper('CheckAttAssEpaule', function (val) {
    if(val=="Technique.Competence.ArmesEpaule.total") return "selected";
  });
  Handlebars.registerHelper('CheckAttAssTrait', function (val) {
    if(val=="Technique.Competence.ArmesTrait.total") return "selected";
  });
  Handlebars.registerHelper('CheckAttAssEmb', function (val) {
    if(val=="Technique.Competence.ArmesEmb.total") return "selected";
  });
  Handlebars.registerHelper('CheckAttAssJet', function (val) {
    if(val=="Survie.Competence.ArmesJet.total") return "selected";
  });
  Handlebars.registerHelper('CheckAttAssLourdes', function (val) {
    if(val=="Survie.Competence.ArmesLourdes.total") return "selected";
  });
  Handlebars.registerHelper('CheckAttAssMelee', function (val) {
    if(val=="Survie.Competence.Melee.total") return "selected";
  });

  // Handlebar de controle des valeurs des types de jets
  Handlebars.registerHelper('TypeJetN', function (val) {
    if(val=="n") {return '<div class="typeJetNactif">Normal</div>';}
    else{return '<div class="typeJetN">Normal</div>';}
  });
  Handlebars.registerHelper('TypeJetSc', function (val) {
    if(val=="sc") {return '<div class="typeJetSCactif">2nde Chance</div>';}
    else{return '<div class="typeJetSC">2nde Chance</div>';}
  });
  Handlebars.registerHelper('TypeJetPMF', function (val) {
    if(val=="pmf") {return '<div class="typeJetPMFactif">Peut mieux faire</div>';}
    else{return '<div class="typeJetPMF">Peut mieux faire</div>';}
  });
  Handlebars.registerHelper('TypeJetE2f', function (val) {
    if(val=="e2f") {return '<div class="typeJetE2Factif">Essaie encore</div>';}
    else{return '<div class="typeJetE2F">Essaie encore </div>';}
  });
  
// Handlebar de controle de la difficultés de jets
  Handlebars.registerHelper('JetDeN', function (val) {
      if(val=="n") {return '<div class="dif1actif">Normal</div>';}
      else{return '<div class="dif1">Normal</div>';}
  });
  Handlebars.registerHelper('JetDeTF', function (val) {
    if(val=="tf") {return '<div class="dif2actif">Facile</div>';}
    else{return '<div class="dif2">Facile</div>';}
});
Handlebars.registerHelper('JetDeTD', function (val) {
    if(val=="td") {return '<div class="dif3actif">Difficile</div>';}
    else{return '<div class="dif3">Difficile</div>';}
});


   
  Handlebars.registerHelper('CheckTypeInd', function (val) {
      if(val=="individuel") return "selected";
  }); 
  Handlebars.registerHelper('CheckTypeVai', function (val) {
      if(val=="vaisseau") return "selected";
  });   
  Handlebars.registerHelper('AfficheArcTir', function (val,arc) {
      if(val=="vaisseau") {            
       return "<tr><td><b>Arc de tir :</b></td><td><input class='inputma' name='system.ArcTir' type='text' value='"+arc+"' size='10' /></td></tr>"; 
      }
  }); 
  Handlebars.registerHelper('AfficheRequis', function (val,arc) {
      if(val=="vaisseau") {            
       return "<tr><td><b>Equipage requis :</b></td><td><input class='inputma' name='system.Vaisseau.EquipageRequis' type='text' value='"+arc+"' size='10' /></td></tr>"; 
      }
  }); 

  // Vérification nombre de eprsonnels déplyés pour une batterie
  Handlebars.registerHelper('VerifEquipage', function (requis,actuel) {
    if(requis>actuel) {           
     return "equipage_alerte";      
    }
    else{return "equipage_ok";}
}); 
Handlebars.registerHelper('AlerteEncombrement', function (enc,max) {
    if(enc>max) { 
    ui.notifications.warn("Trop de marchandises dans la soute du vaisseau !");                   
     return "encombrement_depasse";        
    }
    else {return "stockage";}
}); 
  Handlebars.registerHelper('AfficheActuel', function (val,arc) {
    if(val=="vaisseau") {            
     return "<tr><td><b>Equipage actuel :</b></td><td><input class='inputma' name='system.Vaisseau.EquipageActuel' type='text' value='"+arc+"' size='10' /></td></tr>"; 
    }
}); 
  Handlebars.registerHelper('AfficheOccupation', function (val,arc) {
      if(val=="vaisseau") {            
       return "<tr><td><b>Occupation :</b></td><td><input class='inputma' name='system.Occupation' type='text' value='"+arc+"' size='10' /></td></tr>"; 
      }
  }); 

  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

      switch (operator) {
          case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
              return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
              return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
              return options.inverse(this);
      }
  });

  // Gestion munition des armes
  
      // Gestion blessures PNJ
      Handlebars.registerHelper('PnjIndemne', function (n,blessures) { 
          var accum = "";
           for (var i = 1; i <= n; ++i) {
              var checked = i <= blessures ? "checked" : "";
              accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
          }
          return accum;
      });  
      Handlebars.registerHelper('PnjLeger', function (n,blessures) { 
          var accum = "";
           for (var i = 1; i <= n; ++i) {
              var checked = i <= blessures ? "checked" : "";
              accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
          }
          return accum;
      }); 
      Handlebars.registerHelper('PnjGrave', function (n,blessures) { 
          var accum = "";
           for (var i = 1; i <= n; ++i) {
              var checked = i <= blessures ? "checked" : "";
              accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
          }
          return accum;
      }); 
      Handlebars.registerHelper('PnjMort', function (n,blessures) { 
          var accum = "";
           for (var i = 1; i <= n; ++i) {
              var checked = i <= blessures ? "checked" : "";
              accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
          }
          return accum;
      });  
      Handlebars.registerHelper('Mut', function (n,ind,mut) { 
        var nom ="";
        var checked=""; 
        if(mut==true){
               
        for (var i = 1; i <= n; i++)        
            {
                if(i==1){if(ind.x1){checked="checked";}else{checked="";}}
                if(i==2){if(ind.x2){checked="checked";}else{checked="";}}
                if(i==3){if(ind.x3){checked="checked";}else{checked="";}}
                if(i==4){if(ind.x4){checked="checked";}else{checked="";}}
                if(i==5){if(ind.x5){checked="checked";}else{checked="";}}
                if(i==6){if(ind.x6){checked="checked";}else{checked="";}}
                if(i==7){if(ind.x7){checked="checked";}else{checked="";}}
                if(i==8){if(ind.x8){checked="checked";}else{checked="";}}
                if(i==9){if(ind.x9){checked="checked";}else{checked="";}}
                if(i==10){if(ind.x10){checked="checked";}else{checked="";}}
                if(i==11){if(ind.x11){checked="checked";}else{checked="";}}
                if(i==12){if(ind.x12){checked="checked";}else{checked="";}}            
            nom += '<input type="checkbox" id="CheckboxMin" name="item.system.EnergieX.x'+i+'" '+checked+'>';
            }
        return nom;
        }
        else{ return 'Non dispo';}
    });   

    Handlebars.registerHelper('Pana', function (n,Pa) { 
        var nom ="";
        var checked=""; 
            
        for (var i = 1; i <= n; i++)        
            {
                if(i==1){if(Pa.pan1){checked="checked";}else{checked="";}}
                if(i==2){if(Pa.pan2){checked="checked";}else{checked="";}}
                if(i==3){if(Pa.pan3){checked="checked";}else{checked="";}}
                if(i==4){if(Pa.pan4){checked="checked";}else{checked="";}}
                if(i==5){if(Pa.pan5){checked="checked";}else{checked="";}}
                if(i==6){if(Pa.pan6){checked="checked";}else{checked="";}}
                if(i==7){if(Pa.pan7){checked="checked";}else{checked="";}}           
            nom += '<input type="checkbox" id="CheckboxMin" name="system.Pan.pan'+i+'" '+checked+'>';
            }
        return nom;

    });  

  // Ajustement points Metal Factor
  Handlebars.registerHelper('TypeDeN', function (val) {
    if(val=="n") return "checked";
});


    Handlebars.registerHelper('TypeDeN', function (val) {
        if(val=="n") return "checked";
    });
  

    Handlebars.registerHelper('TypeDeSc', function (val) {
        if(val=="sc") return "checked";
    }); 
    Handlebars.registerHelper('TypeDePmf', function (val) {
        if(val=="pmf") return "checked";
    }); 
    Handlebars.registerHelper('TypeDeE2f', function (val) {
        if(val=="e2f") return "checked";
    });    
    Handlebars.registerHelper('CheckTypeInd', function (val) {
        if(val=="individuel") return "selected";
    }); 
    Handlebars.registerHelper('CheckTypeVai', function (val) {
        if(val=="vaisseau") return "selected";
    });   
    Handlebars.registerHelper('AfficheArcTir', function (val,arc) {
        if(val==="vaisseau") {            
         return "<tr><td><b>Arc de tir :</b></td><td><input class='inputma' name='system.ArcTir' type='text' value='"+arc+"' size='10' /></td></tr>"; 
        }
    });  
    Handlebars.registerHelper('AfficheOccupation', function (val,arc) {
        if(val=="vaisseau") {            
         return "<tr><td><b>Occupation :</b></td><td><input class='inputma' name='system.Occupation' type='text' value='"+arc+"' size='10' /></td></tr>"; 
        }
    }); 


    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

 
        // Gestion blessures PNJ
        Handlebars.registerHelper('PnjIndemne', function (n,blessures) { 
            var accum = "";
             for (var i = 1; i <= n; ++i) {
                var checked = i <= blessures ? "checked" : "";
                accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
            }
            return accum;
        });  
        Handlebars.registerHelper('PnjLeger', function (n,blessures) { 
            var accum = "";
             for (var i = 1; i <= n; ++i) {
                var checked = i <= blessures ? "checked" : "";
                accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
            }
            return accum;
        }); 
        Handlebars.registerHelper('PnjGrave', function (n,blessures) { 
            var accum = "";
             for (var i = 1; i <= n; ++i) {
                var checked = i <= blessures ? "checked" : "";
                accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
            }
            return accum;
        }); 
        Handlebars.registerHelper('PnjMort', function (n,blessures) { 
            var accum = "";
             for (var i = 1; i <= n; ++i) {
                var checked = i <= blessures ? "checked" : "";
                accum += `<input id='CheckboxMin' data-valeur='${i}' ${checked} type='checkbox' data-dtype='Boolean' />`;
            }
            return accum;
        }); 
// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.metadv.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "bmetadv.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}
Hooks.on('getSceneControlButtons', (controls) => {
  controls.find((c) => c.name === 'token').tools.push({
    name: 'MetalFactor',
    title: game.i18n.localize("METADV.tracker.title"),
    icon: 'fas fa-box-open',
    onClick() {
      MetalFactor.toggle();
    },
    button: true,
  }, {
    name: 'Dice Roller',
    title: game.i18n.localize("METADV.roll.roller"),
    icon: 'fas fa-dice-d20',
    button: true,
    onClick() {
      DuneRoll.ui();
    }
  });
});