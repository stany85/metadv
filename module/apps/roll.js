class CompetenceDialog extends Dialog {
  constructor(dialogData = {}, options = {}) {
    super(dialogData, options);
    this.options.classes = ['Competencedialog'];
  }

  /**
   * A custom dialog factory for our use case.
   * @param {object} options
   * @param {string} options.name - The name of whoever we are greeting
   * @returns {Promise}
   */
  static async create(options) {
    return new Promise(resolve => {
      new this({
        title: `A custom dialog named: ${options.name}`,
        content: `Hello ${options.name}`,
        buttons: {
          hello: { label: "Hello!", callback: () => { resolve(true) }}
        },
        close: () => { resolve(false) }
      }).render(true);
    });
  }
}