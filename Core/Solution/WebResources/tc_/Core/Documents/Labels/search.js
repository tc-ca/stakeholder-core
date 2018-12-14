var existing = [];
if (typeof labels != 'undefined') existing = labels;

var labels = {
    documentSearch: {
        "add": { "1033": "Add Selected", "1036": "ajouter sélectionnée" },
        "application": { "1033": "Application", "1036": "Application" },
        "author": { "1033": "Author", "1036": "Auteur" },
        "clear": { "1033": "Start New Search", "1036": "commencer une nouvelle recherche" },
        "createdOn": { "1033": "Created On", "1036": "Crée Sur" },
        "documentName": { "1033": "Document Name", "1036": "Nom du Document" },
        "documentNumber": { "1033": "Document Number", "1036": "Numéro SGDDI" },
        "duplicateException": { "1033": "This document is now being tracked in CRM. Would you like to view it now?", "1036": "Ce document a été traqué dans CRM. Voulez-vous l'ouvrir maintenant?" },
        "noDocuments": { "1033": "There are no documents associated with this record", "1036": "Aucun documents associé à cet record" },
        "opi": { "1033": "OPI", "1036": "BPR" },
        "search": { "1033": "Search", "1036": "Chercher" }
    }
}

for (var key in existing) labels[key] = existing[key];
