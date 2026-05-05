# Members

Ce projet permet de gérer les membres d'une association. Il s'agit d'un projet uniquement front-end.

## Structure

La page est constitué d'un menu à gauche, et du contenu à droite. Si le contenu dépasse de l'écran, une barre de défilement appraît, et la section de contenu est scrollable. Le menu reste alors fixe et ne défile pas.

## Menu

Le menu contient des liens vers certaines pages :
- Liste des membres
- Ajouter un membre

## Liste des membres

- Les membres sont affichés, avec leur nom et leur prénom. 
- La liste des membres est stockée et récupérée dans le local storage.
- Pour chaque membre, une bouton permet de modifier et un autre de supprimer un membre.
- Un lien permet d'ajouter un membre.

### Ajouter un membre

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page d'ajout d'un membre

### Supprimer un membre

Lors du clic sur le bouton, le membre est supprimé du local storage, et la liste est mise à jour.

### Modifier un membre

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page de modification d'un membre.

## Ajout d'un membre

Un formulaire permet d'ajouter un membre en saisissant son nom et son prénom. 
- Les champs sont initialement vides.
- Le nom et le prénom sont obligatoires.
- Si l'un des champ est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
    - Si les champs sont valides, le membre est ajouté au local storage, et l'utilisateur est redirigé sur la page de la liste des membres, qui a été mise à jour avec le nouveau membre.
    - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.


## Modification d'un membre

Un formulaire permet de modifier un membre en saisissant son nom et son prénom. 
- Les champs sont initialisés avec leur valeur enregistrée.
- Le nom et le prénom sont obligatoires.
- Si l'un des champ est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
    - Si les champs sont valides, le membre est modifié dans le local storage, et l'utilisateur est redirigé sur la page de la liste des membres, qui a été mise à jour avec le nouveau membre.
    - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
