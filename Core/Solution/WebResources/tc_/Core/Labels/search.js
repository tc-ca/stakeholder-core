var existing = {};
if (typeof labels != 'undefined' )  existing = labels;

var labels = {
    coreSearch: {
        "add": { "1033": "Add Selected", "1036": "Ajouter" },
        "addFilter": { "1033": "Add a filter", "1036": "Ajoute un filtre" },
        "after": { "1033": "After", "1036": "Après" },
        "before": { "1033": "Before", "1036": "Avant" },
        "dateValidation": { "1033": "Invalid date entered", "1036": "La date donnée est invalide" },
        "date": { "1033": "Date", "1036": "Date" },
        "filter": { "1033": "Filter By", "1036": "Filtre Sur" },
        "operator": { "1033": "Operator", "1036": "Opérateur" },
        "search": { "1033": "Search", "1036": "Recherche" },
        "value": { "1033": "Value", "1036": "Valeur" },
        "duplicateException": { "1033": "This record is already being tracked in CRM. Do you wish to view it now?", "1036": "Ce record déja existe dans Dynamics CRM. Est-ce que vous voulez l'ouvert maintenant?" }
    }
};

for (var key in existing) labels[key] = existing[key];
