// Contact Book Management
// Stores nickname -> peer information mapping

export class ContactBook {
    constructor() {
        this.contacts = this.loadContacts();
    }

    loadContacts() {
        const saved = localStorage.getItem('amas_contacts_v1');
        return saved ? JSON.parse(saved) : {};
    }

    saveContacts() {
        localStorage.setItem('amas_contacts_v1', JSON.stringify(this.contacts));
    }

    // Add or update a contact
    addContact(nickname, data) {
        this.contacts[nickname.toLowerCase()] = {
            nickname,
            threadsId: data.threadsId || '',
            instagramId: data.instagramId || '',
            peerId: data.peerId || '',
            lastSeen: new Date().toISOString(),
            ...data
        };
        this.saveContacts();
    }

    // Find contact by nickname (fuzzy match)
    findContact(query) {
        const lowerQuery = query.toLowerCase();

        // Exact match
        if (this.contacts[lowerQuery]) {
            return this.contacts[lowerQuery];
        }

        // Partial match
        for (const [key, contact] of Object.entries(this.contacts)) {
            if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
                return contact;
            }
        }

        return null;
    }

    // Get all contacts
    getAllContacts() {
        return Object.values(this.contacts);
    }

    // Delete contact
    deleteContact(nickname) {
        delete this.contacts[nickname.toLowerCase()];
        this.saveContacts();
    }
}

export default new ContactBook();
