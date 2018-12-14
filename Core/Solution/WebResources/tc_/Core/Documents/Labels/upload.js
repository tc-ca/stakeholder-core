var existing = [];
if (typeof labels != 'undefined') existing = labels;

var labels = {
    uploadDm: {
        "authorLabel": { "1033": "Author", "1036": "Auteur" },
        "classificationLabel": { "1033": "Classification", "1036": "Classification" },
        "COMMUNICATION": { "1033": "Error communicating with RDIMS", "1036": "Erreur avec la communication à SGDDI" },
        "couldNotTrack": { "1033": "Error tracking the new document in CRM", "1036": "Erreur avec l'alignment du nouveau document" },
        "descriptionLabel": { "1033": "Description", "1036": "Description" },
        "duplicateDocument": { "1033": "Document with RDIMS #{0} has already been added", "1036": "Document avec la numéro SGDDI #{0} a été déja attaché" },
        "fileUploadLabel": { "1033": "Browse…", "1036": "Choisi…" },
        "GENERAL_FAILURE": { "1033": "The server responded with an error", "1036": "La serveur a retourne une erreur " },
        "invalidAuthor": { "1033": "Invalid author specified", "1036": "L'autheur spécifié n'est pas valide" },
        "invalidFile": { "1033": "Invalid file selected", "1036": "Le document spécifié n'est pas valide" },
        "invalidNumber": { "1033": "Invalid number specified", "1036": "Numéro specifié n'est pas valide" },
        "languageLabel": { "1033": "Language", "1036": "Langue" },
        "languageSelectBi": { "1033": "Bilingual", "1036": "Bilingue" },
        "languageSelectEn": { "1033": "English", "1036": "Anglais" },
        "languageSelectFr": { "1033": "French", "1036": "Français" },
        "nameLabel": { "1033": "Document Name", "1036": "Nom du document" },
        "NOT_FOUND": { "1033": "The specified document could not be found", "1036": "Le document spécifié ne trouve pas" },
        "notFound": { "1033": "Document with RDIMS #{0} does not exist", "1036": "Le document avec la numéro SGDDI #{0} n'existe pas" },
        "opiLabel": { "1033": "OPI", "1036": "BPR" },
        "securityLabel": { "1033": "Security", "1036": "Sécurité" },
        "securitySelectA": { "1033": "Protected A", "1036": "Protégé A" },
        "securitySelectU": { "1033": "Unclassified", "1036": "Non classé" },
        "UPLOAD_FAIL_CLASSIFICATION": { "1033": "The specified classification is invalid", "1036": "La classification n'est pas valide" },
        "UPLOAD_FAIL_DATA": { "1033": "The selected file cannot be uploaded to RDIMS", "1036": "SGDDI n'accepte pas ce format de fichier" },
        "UPLOAD_FAIL_DOC_NAME": { "1033": "The specified document name is invalid", "1036": "Le nom du document n'est pas valide" },
        "UPLOAD_FAIL_FILE_EXTENSION": { "1033": "The selected file cannot be uploaded to RDIMS", "1036": "SGDDI n'accepte pas ce format de fichier" },
        "UPLOAD_FAIL_OPI": { "1033": "The specified OPI is invalid", "1036": "Le BPR n'est pas valide" },
        "UPLOAD_FAIL_PROFILE": { "1033": "The server responded with an error", "1036": "La serveur a retourne une erreur " },
        "UPLOAD_FAIL_SECURITY": { "1033": "The specified security level is invalid", "1036": "La sécurité specifié n'est pas valide" },
        "submit": { "1033": "upload…", "1036": "télécharger…" },
        "openButton": { "1033": "open…", "1036": "ouvert…" }
    }
};

for (var key in existing) labels[key] = existing[key];
