/*
 * @see https://github.com/flamewave000/dragonflagon-fvtt/blob/master/df-chat-enhance/src/privacy/df-chat-privacy.ts
 */

const ICONS_FOR_KNOWN_ROLL_TYPES = {
  publicroll: 'fas fa-dice-d20',
  gmroll: 'fas fa-user-secret',
  blindroll: 'fas fa-user-ninja',
  selfroll: 'fas fa-ghost',
};

export default class ChatRollPrivacy {
  static setup() {
    game.keybindings.register('metadv', 'roll-mode.publicroll', {
      name: 'Public Roll',
      editable: [{ key: 'KeyQ', modifiers: [KeyboardManager.MODIFIER_KEYS.ALT] }],
      namespace: 'Roll Type Shortcuts',
      onDown: () => {
        $('#rpg-ui-buttons > button[data-id="publicroll"]').trigger('click');
      },
    });
    game.keybindings.register('metadv', 'roll-mode.gmroll', {
      name: 'Private GM Roll',
      editable: [{ key: 'KeyW', modifiers: [KeyboardManager.MODIFIER_KEYS.ALT] }],
      namespace: 'Roll Type Shortcuts',
      onDown: () => {
        $('#rpg-ui-buttons > button[data-id="gmroll"]').trigger('click');
      },
    });
    game.keybindings.register('metadv', 'roll-mode.blindroll', {
      name: 'Blind GM Roll',
      editable: [{ key: 'KeyE', modifiers: [KeyboardManager.MODIFIER_KEYS.ALT] }],
      namespace: 'Roll Type Shortcuts',
      onDown: () => {
        $('#rpg-ui-buttons > button[data-id="blindroll"]').trigger('click');
      },
    });
    game.keybindings.register('metadv', 'roll-mode.selfroll', {
      name: 'Self Roll',
      editable: [{ key: 'KeyR', modifiers: [KeyboardManager.MODIFIER_KEYS.ALT] }],
      namespace: 'Roll Type Shortcuts',
      onDown: () => {
        $('#rpg-ui-buttons > button[data-id="selfroll"]').trigger('click');
      },
    });
  }

  static init() {
    game.settings.register('metadv', 'enabled', {
      name: 'RPGUI.SETTINGS.EnableTitle',
      hint: 'RPGUI.SETTINGS.EnableHint',
      scope: 'client',
      type: Boolean,
      default: true,
      config: true,
      onChange: () => {
        location.reload();
      },
    });
    game.settings.register('metadv', 'replace-buttons', {
      name: 'RPGUI.SETTINGS.ReplaceButtonsTitle',
      hint: 'RPGUI.SETTINGS.ReplaceButtonsHint',
      scope: 'client',
      type: Boolean,
      default: true,
      config: true,
      onChange: () => {
        location.reload();
      },
    });

    if (
      !game.settings.get('metadv', 'enabled')
    ) {
      return;
    }

    Hooks.on('renderChatLog', this._handleChatLogRendering);
  }

  static calcColour(current, count) {
    return `rgb(${(current / count) * 255},${(1 - (current / count)) * 255},0)`;
  }

  static async _handleChatLogRendering(chat, html, data) {
    const modes = Object.keys(data.rollModes);
    const buttons = [];
    const iconKeys = Object.keys(ICONS_FOR_KNOWN_ROLL_TYPES);
    for (let c = 0; c < modes.length; c++) {
      const rt = modes[c];
      if (!(rt in ICONS_FOR_KNOWN_ROLL_TYPES)) {
        console.warn(Error(`Unknown roll type '${rt}'`));
        continue;
      }
      buttons.push({
        rt: rt,
        name: game.i18n.localize(data.rollModes[rt]),
        active: data.rollMode === rt,
        icon: ICONS_FOR_KNOWN_ROLL_TYPES[rt],
        colour: ChatRollPrivacy.calcColour(iconKeys.findIndex(x => x == rt), iconKeys.length),
      });
    }
    const buttonHtml = $(await renderTemplate('systems/metadv/templates/apps/privacy-button.hbs', { buttons }));
    buttonHtml.find('button').on('click', function () {
      const rollType = $(this).attr('data-id');
      game.settings.set('core', 'rollMode', rollType);
      buttonHtml.find('button.active').removeClass('active');
      $(this).addClass('active');
    });
    html.find('select[name=rollMode]').after(buttonHtml);
    html.find('select[name=rollMode]').remove();

    if (!game.settings.get('metadv', 'replace-buttons'))
      return;

    // Adjust the button container to remove the extra margin since those buttons are now moving in.
    buttonHtml.attr('style', 'margin:0 0 0 0.5em');

    // Convert the old <a> tag elements to <button> tags
    let first = true;
    html.find('#chat-controls div.control-buttons a').each(function () {
      const html = $(this).html();
      const classes = $(this).attr('class');
      const ariaLabel = $(this).attr('aria-label');
      const tooltip = $(this).attr('data-tooltip');
      const style = $(this).attr('style');
      const click = $._data(this, 'events')['click'][0].handler;
      const button = $(`<button class="${classes}" aria-label="${ariaLabel}" data-tooltip="${tooltip}" style="${style}">${html}</button>`);
      button.on('click', click);
      // Add a small margin between the first button and the RollTypes
      if (first) {
        button.attr('style', 'margin-left:0.5em');
        first = false;
      }
      buttonHtml.append(button);
    });

    html.find('#chat-controls div.control-buttons').remove();
  }
}
