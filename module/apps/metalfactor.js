const KEY = "metadv";
const SOCK_KEY = 'system.' + KEY;
export class MetalFactor {
  constructor() {
    this.metaljoueur = 50;
    this.metalmj = 0;

  }

  data() {
  
    return { metaljoueur: this.metaljoueur, metalmj: this.metalmj };
  }

  save() {
    game.settings.set(KEY, "metaljoueur", this.metaljoueur);
    game.settings.set(KEY, "metalmj", this.metalmj);
  }

  show() {
    const template = "systems/metadv/templates/apps/metalfactor.hbs";
    let me = this;
    if (!this.tracker) {
      this.tracker = new Application({ title: "Metal Factor", template: template });
      this.tracker.getData = function () { return me.data(); };
      let _pos = false;
    }
    this.tracker.render(true);
    
  }

  pos() {
    let m = $("#sidebar").position().top || 5;
    let pos = {
      top: $(window).height() - m - ((this.tracker.position || {}).height || 133),
      left: $("#sidebar").position().left - m - ((this.tracker.position || {}).width || 200)
    };
    this.tracker.setPosition(pos);
  }

  refresh() {
    this.refreshData();
    this.tracker.render(false);
  }
  majMfJoueur(a){
    game.settings.set("metadv", "metaljoueur",a) ;
    nouveaupointsMFmj = number(50-a);
    game.settings.set("metadv", "metalmj",nouveaupointsMFmj) ;   

  }
  refreshData() {
 
    this.metaljoueur = game.settings.get(KEY, "metaljoueur");
    this.metalmj = game.settings.get(KEY, "metalmj");
  }

  toggle() {
    if (this.tracker?._state > 0)
      this.tracker.close();
    else
      this.show();
  }


};

export const metalfactor = new MetalFactor();

Hooks.on("setup", function () {
  const def = { scope: "world", onChange: function () { metalfactor.refresh() }, type: Number, default: 50 };
  const def2 = { scope: "world", onChange: function () { metalfactor.refresh() }, type: Number, default: 0 };
  game.settings.register(KEY, "metaljoueur", Object.assign(def, { name: "metaljoueur" }));
  game.settings.register(KEY, "metalmj", Object.assign(def2, { name: "metalmj" }));
});

Hooks.on("ready", function () {
  metalfactor.refreshData();
  metalfactor.show();

  if (game.user.isGM) {
    game.socket.on(SOCK_KEY, data => {
      let ct = null;
      switch (data.type) {
        case "threat-increase":
          metalfactor.plusThreat();
          ct = game.i18n.localize("METADV.chat.threat-increase");
          break;
        case "momentum-decrease":
          metalfactor.minusMomentum();
          ct = game.i18n.localize("METADV.chat.momentum-decrease");
          break;
        default:
          console.log("Message inconnu: ", data);
      }
      if (ct)
        ChatMessage.create({ content: Handlebars.compile(ct)(data) });




    })
  }
  

});

