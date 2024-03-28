import ChatRollPrivacy from './chat-roll-privacy.js';

Hooks.on('ready', async () => {
  // Retrait de la classe de Monk's Little Details
  // Créer une erreur lorsque le module n'est pas activé
  if (game.settings.settings.has('monks-little-details.window-css-changes')) {
      game.settings.set("monks-little-details", "window-css-changes", false);
      $("body").removeClass("change-windows");
  }
});

Hooks.on("init", () => {
  ChatRollPrivacy.init();
});

Hooks.once('setup', function () {
  ChatRollPrivacy.setup();
});
