# Tutoring

Ce projet permet de gérer une association de soutien scolaire. Il s'agit d'un projet uniquement front-end.

## Structure

La page est constitué d'un menu à gauche, et du contenu à droite. Si le contenu dépasse de l'écran, une barre de défilement appraît, et la section de contenu est scrollable. Le menu reste alors fixe et ne défile pas.

## Menu

Le menu contient des liens vers certaines pages :

- Liste des familles
- Liste des bénévoles

## Liste des familles

### Modèle

- L'association permet l'adhésion de familles.
- Une famille peut être constituée constituée de plusieurs membres.
- La cotisation est versée pour toute la famille, quel que soit le nombre de membres.
- Une famille a un nom et des informations supplémentaires.
- Un membre peut être un parent ou un enfant. Il a un nom de famille (qui peut être différent du nom de famille), un prénom, un email, une date de naissance, des langues parlées, une liste de numéros de téléphone et des informations supplémentaires.

### Écran

- Les familles sont affichées, avec l'état de la cotisation, leur nom, les informations supplémentaires, des boutons permettent d'afficher le détail d'une famille, de modifier la famille, ou de la supprimer, et une icone indique si la famille est pliée ou dépliée.
- Sous chaque famille en mode dépliée, la liste des membres de la famille est affichée, avec leur prénom, nom de famille, numéro de téléphone, email, date de naissance, langues parlées, informations supplémentaires, un bouton pour modifier le membre, et un bouton pour supprimer le membre.
- La liste des familles et de leurs membres est stockée et récupérée dans le local storage.
- Un clic sur la ligne d'une famille permet d'afficher ou de cacher la liste des membre.
- Un bouton permet d'ajouter une famille

### Détail d'une famille

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page de détail d'une famille.

### Modifier une famille

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page de modification d'une famille.

### Supprimer une famille

Lors du clic sur le bouton, une popin de confirmation est affichée. En cas de validation, la famille est supprimé du local storage, ainsi que tous ses membres, et la liste est mise à jour.

### Modifier un membre

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page de modification d'un membre d'une famille.

### Supprimer un membre

Lors du clic sur le bouton, une popin de confirmation est affichée. En cas de validation, le membre est supprimé du local storage, et la liste est mise à jour.

### Ajout d'une famille

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page d'ajout d'une famille.

## Ajout d'une famille

Un formulaire permet d'ajouter une famille en saisissant son nom, son adresse, et ses informations supplémentaires.

- Les champs sont initialement vides.
- Le nom est obligatoire.
- Si le nom est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Si un champ de l'adresse n'est pas vide, la rue, le code postal et la ville sont obligatoires. Des messages d'erreurs s'affichent si le champ a été touché et n'est pas valide.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
  - Si le formulaire est valide, la famille est ajoutée au local storage, et l'utilisateur est redirigé sur la page de détail de la famille.
  - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
- Un bouton d'annulation est présent. Au clic, l'utilisateur revient sur la page précédente, ou sur la page de la famille à défaut.

## Modifier une famille

Un formulaire permet de modifier une famille en saisissant son nom, son adresse, et ses informations supplémentaires.

- Les champs sont renseignés avec leur valeur enregistrée.
- Le nom est obligatoire.
- Si le nom est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Si un champ de l'adresse n'est pas vide, la rue, le code postal et la ville sont obligatoires. Des messages d'erreurs s'affichent si le champ a été touché et n'est pas valide.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
  - Si le formulaire est valide, la famille est modifiée dans le local storage, et l'utilisateur est redirigé sur la page de détail de la famille.
  - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
- Un bouton d'annulation est présent. Au clic, l'utilisateur revient sur la page précédente, ou sur la page de la famille à défaut.

## Détail d'une famille

- Le nom de la famille est affiché.
- L'état de la cotisation, l'adresse et les informations supplémentaires de la famille sont affichées.
- La liste des membres de la famille est affichée, avec le prénom, le nom, le numéro de téléphone, l'email, la date de naissance, les langues parlées et les informations supplémentaires de chaque membre, ainsi qu'un bouton pour modifier et un bouton pour supprimer chaque membre.
- Un bouton permet d'ajouter un membre
- Un bouton permet de modifier la famille
- Un bouton permet de supprimer la famille
- Un bouton permet de modifier la cotisation

### Modifier la famille

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page de modification d'une famille.

### Supprimer la famille

Lors du clic sur le bouton, une popin de confirmation est affichée. En cas de validation, la famille est supprimé du local storage, ainsi que tous ses membres, et l'utilisateur est redirigé vers la liste des familles.

### Ajouter un membre

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page d'ajout d'un membre d'une famille.

### Modifier un membre

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page de modification d'un membre d'une famille.

### Supprimer un membre

Lors du clic sur le bouton, le membre est supprimé du local storage, et la liste est mise à jour.

### Valider / modifier la cotisation

Lors du clic sur le bouton, une popin permet de modifier la date de validité de la cotisation. Il est possible de l'effacer pour supprimer la cotisation.
Si la famille n'avait pas de cotisation précédente, ou avec une cotisation expirée, le champ est initialisé avec la date de dans 1 an. Sinon il s'agit de la date renseignée.

## Ajout d'un membre d'une famille

Un formulaire permet d'ajouter un membre en saisissant son type (parent ou enfant), son nom, son prénom, son email, ses numéros de téléphone, sa date de naissance, ses langues parlées et ses informations supplémentaires.

- Le membre est par défaut un parent
- Le nom est pré-rempli avec le nom de la famille.
- Les autres champs sont initialement vides.
- Le nom et le prénom sont obligatoires.
- Les autres champs ne sont pas obligatoire.
- Plusieurs numéros de téléphone et langues peuvent être saisis en appuyant sur le bouton +.
- Un numéro de téléphone ou une langue peut être supprimé en appuyant sur -.
- Si l'un des champs obligatoires est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
  - Si les champs sont valides, le membre est ajouté à sa famille dans le local storage, et l'utilisateur est redirigé sur la page d'où il vient, ou sur le détail de la famille à défaut.
  - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
- Un bouton d'annulation est présent. Au clic, l'utilisateur revient sur la page précédente, ou sur le détail de la famille à défaut.

## Modification d'un membre d'une famille

Un formulaire permet de modifier un membre en saisissant son type (parent ou enfant), son nom, son prénom, son email, ses numéros de téléphone, sa date de naissance, ses langues parlées et ses informations supplémentaires.

- Les champs sont initialisés avec leur valeur enregistrée.
- Le nom et le prénom sont obligatoires.
- Si l'un des champs obligatoires est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
  - Si les champs sont valides, le membre est modifié dans le local storage, et l'utilisateur est redirigé sur la page d'où il vient, ou sur le détail de la famille à défaut.
  - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
- Un bouton d'annulation est présent. Au clic, l'utilisateur revient sur la page précédente, ou sur le détail de la famille à défaut.

## Liste des bénévoles

- Les bénévoles sont affichés, avec l'info d'encadrant, leur nom et prénom, numéros de téléphones, email, langues parlées, les informations supplémentaires, et des boutons permettent de modifier ou supprimer le bénévole.
- La liste des bénévoles est stockée et récupérée dans le local storage.
- Un bouton permet d'ajouter un bénévole.

### Modifier un bénévole

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page de modification d'un bénévole.

### Supprimer un bénévole

Lors du clic sur le bouton, une popin de confirmation est affichée. En cas de validation, le bénévole est supprimé du local storage, et la liste est mise à jour.

### Ajout d'un bénévole

Lors du clic sur le bouton, l'utilisateur est redirigé vers la page d'ajout d'un bénévole.

## Ajout d'un bénévole

Un formulaire permet d'ajouter un bénévole en saisissant s'il est encadrant ou non, son nom, son prénom, son email, ses numéros de téléphones, ses langues parlées, et ses informations supplémentaires.

- Le bénévole est un encadrant par défaut.
- Les champs sont initialement vides.
- Le nom et le prénom sont obligatoires.
- Si le nom ou le prénom est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
  - Si le formulaire est valide, le bénévole est ajouté au local storage, et l'utilisateur est redirigé sur la liste des bénévoles.
  - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
- Un bouton d'annulation est présent. Au clic, l'utilisateur revient sur la page précédente, ou sur la liste des bénévoles par défaut.

## Modification d'un bénévole

Un formulaire permet de modifier un bénévole en saisissant s'il est encadrant ou non, son nom, son prénom, son email, ses numéros de téléphones, ses langues parlées, et ses informations supplémentaires.

- Les champs sont initié avec les valeurs enregistrées du bénévole.
- Le nom et le prénom sont obligatoires.
- Si le nom ou le prénom est vide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
  - Si le formulaire est valide, le bénévole est ajouté au local storage, et l'utilisateur est redirigé sur la liste des bénévoles.
  - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
- Un bouton d'annulation est présent. Au clic, l'utilisateur revient sur la page précédente, ou sur la liste des bénévoles par défaut.

## Liste des cours

- Les cours sont affichés, avec l'élève, l'encadrant, le jour et l'heure, le lieu, la date de début et la date de fin.
- La liste des cours est stockée et récupérée dans le local storage.
- Un bouton permet d'ajouter un cours.
- Un bouton permet de modifier un cours.
- Un bouton permet d'arrêter ou reprendre un cours, selon la date de fin.
- Un bouton permet de supprimer un cours.

## Ajout ou modification d'un cours

Un formulaire permet d'ajouter un cours en saisissant l'élève et l'encadrant, le jour et l'heure, le lieu, la date de début, et la date de fin.

- L'élève, l'encadrant, le jour, l'heure, le lieu et la date de début sont obligatoires.
- La date de début est initialisée avec la date du jour.
- L'élève est choisi parmi une liste déroulante de l'ensemble des enfants enregistrés.
- L'encadrant est choisi parmi une liste déroulante de l'ensemble des encadrants.
- Le lieu est "Local" par défaut
- Si un champ est invalide après une modification, un message d'erreur apparaît en dessous. Il n'y a pas de message d'erreur à l'ouverture de la page.
- Le formulaire est validé lors du clic sur le bouton de validation, ou lors d'un appui sur la touche Entrée
  - Si le formulaire est valide, le cours est ajouté au local storage (ou modifié), et l'utilisateur est redirigé sur la page précédente, ou la liste des cours.
  - Si un champ n'est pas valide, le bouton de validation est désactivé, et l'appui sur la touche Entrée n'a pas d'effet.
- Un bouton d'annulation est présent. Au clic, l'utilisateur revient sur la page précédente, ou sur la liste des cours par défaut.

## Détail d'un membre d'une famille

- Le nom et prénom sont affichés.
- Le type parent ou enfant est affiché, avec l'icone associée.
- S'ils sont renseignés, la date de naissance, langues parlées, numéros de téléphone, email, et renseignements complémentaires sont affichés.
- La liste des cours est affichée.
- Un bouton permet de modifier le membre
- Un bouton permet de supprimer le membre
- Un bouton permet de revenir à la famille
