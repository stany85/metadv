export class MetadvOutils {
    static async init() {
        Hooks.on('renderChatLog', (log, html, data) => MetadvOutils.chatListeners(html))
        Hooks.on("getChatLogEntryContext", (html, options) => MetadvOutils.chatRollMenu(html, options))
    
        Hooks.on("getCombatTrackerEntryContext", (html, options) => {
        MetadvOutils.pushInitiativeOptions(html, options);
        })
    
        this.rollDataStore = {}
        this.defenderStore = {}
    
        Handlebars.TMLModElement
        }
    
}    
