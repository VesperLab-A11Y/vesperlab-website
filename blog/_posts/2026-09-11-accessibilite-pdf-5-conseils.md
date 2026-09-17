---
title: Accessibilité PDF : 5 conseils qui font écho
description: Quelles que soient vos raisons, vous en avez forcément une bonne pour améliorer l'accessibilité de vos PDF.
category: Guide pratique
tags: PDF, documents, bureautique
resources:
  - Text-to-Speech Market Report | https://www.expertmarketresearch.com/reports/text-to-speech-market | Croissance projetée du marché TTS, citée dans l'article
  - OpenDataLoader | https://opendataloader.org/docs#why-opendataloader | Alternative open-source basée sur l'IA pour le balisage automatique de PDF
  - AxeCheck | https://check.axes4.com/en | Scan gratuit d'accessibilité PDF
  - Adobe Acrobat | | Seul logiciel reconnu, à ma connaissance, pour un balisage automatique fiable
---

Les documents PDF sont des acteurs récurrents du film de notre vie. On les utilise au travail, pour communiquer avec l'administration, pour payer nos factures électroniques, ou pour signer nos contrats en ligne. Pourtant, ils sont les grands mal-aimés de l'accessibilité. Être si essentiel qu'on en oublie sa présence : voilà le plus grand des compliments. Or, un document pas, peu ou mal tagué, peut devenir une véritable barrière, au lieu de l'aide précieuse qu'il est censé apporter.

Rendre un PDF accessible, c'est s'assurer de laisser une porte ouverte, au lieu de laisser le vent décider de l'angle d'ouverture qu'elle adoptera. Cela permet à un public qui utilise des technologies d'assistance d'accéder à votre contenu sans difficulté. Il devient aussi possible d'utiliser des fonctions de Text-To-Speech, un marché en pleine expansion. Proposé en ligne, un document PDF accessible est aussi une mine d'or pour le SEO. Quelles que soient vos raisons, vous en avez forcément une bonne pour améliorer l'accessibilité de vos PDF.

> [!INFO]
> Le marché du Text-to-Speech connaît une croissance projetée de 23 % par an jusqu'en 2035 ([source](https://www.expertmarketresearch.com/reports/text-to-speech-market)).

## PDF : Quézako ?

Le PDF (Portable Document Format) est un format largement utilisé dans le monde pour partager des documents grâce à sa facilité d'accès et de lecture par les navigateurs et logiciels. Il est rendu accessible aux technologies (d'assistance, de text-to-speech, d'intelligence artificielle…) grâce à sa sémantique.

Sur le web comme dans la création d'un document, on utilise des tags sémantiques pour indiquer la nature de l'élément. Par exemple, sur le web, on utilisera <h1> pour le plus gros des titres, <img> pour indiquer la présence d'une image, <a> pour un lien, et <p> pour un paragraphe. Ces tags servent à indiquer au navigateur quel comportement adopter, mais servent aussi d'indications précises pour les différentes technologies. Ainsi, une personne qui utilise un lecteur d'écran, saura rapidement quels sont les titres présents, et pourra les utiliser pour comprendre le contenu et naviguer. Les documents PDF utilisent la même structure sémantique. La personne qui accède au document peut alors, de la même manière, repérer les titres, et naviguer vers les bonnes sections.

Il y a plusieurs manières de créer un PDF, et toutes ne permettent pas de créer des documents correctement tagués. Par exemple, scanner un document produit un PDF qui est reconnu comme une image : ni un lecteur d'écran, ni une application de TTS ne pourront lire le contenu de la page, et il est fort à parier que votre agent IA ne comprenne pas tout. Dans le cas où vous utilisez une technologie de tag automatique (comme Acrobat) pour corriger ça, il est possible qu'elle-même ne saisisse pas les nuances. Vous pourriez alors le faire manuellement, en espérant que le document ne contienne pas 80 pages de tableaux. Il est parfois plus facile, ou plus rapide, de recréer un document de bout en bout !

## Changer de chaussures

En français, on utilise l'expression "Se mettre dans les chaussures (de quelqu'un)" pour illustrer l'utilisation de l'empathie. L'empathie est la capacité émotionnelle de se mettre à la place d'une autre personne, pour comprendre ses sentiments et sa situation. Chez VesperLab, c'est un de nos principaux piliers, l'empathie fait partie intégrante de chaque audit et accompagne la création de nos outils. Pourquoi ? Et bien, simplement parce qu'on ne peut pas concevoir correctement quelque chose si on ne se met jamais à la place de celles et ceux qui vont l'utiliser. Et l'empathie n'est pas un réflexe, mais un muscle qu'on travaille.

Concevoir (avec) l'accessibilité, c'est accepter de retirer ses chaussures, et enfiler celles du voisin. Et on ne naît pas toutes et tous avec les mêmes chaussures, en fonction de là d'où on vient, de comment on marche, des terrains qu'on foule, ou simplement de si on est physiquement capables d'utiliser nos pieds. Statistiquement, il est fort à parier que vous regorgiez de différentes paires de chaussures dans votre entourage. Parler avec leurs propriétaires et les écouter parler des chemins qu'ils et elles parcourent est déjà un pas vers l'empathie. Lire, écouter, entendre, toucher, essayer et comprendre les expériences des autres ouvre plus facilement le champ de vos possibles. Et qui sait, cela pourrait même changer votre manière d'appréhender votre manière d'écrire votre document (ou votre code).

## Partir sur une base solide

J'ai expliqué plus haut qu'un document PDF accessible est un document (correctement) écrit avec des balises sémantiques. Si j'ai abordé rapidement leur utilisation en HTML, ces mêmes balises sont disponibles sur les logiciels de traitement de texte. La suite Word est particulièrement reconnue pour son exportation en PDF, ainsi que la suite Libre, là où la suite Google, elle, présente des lacunes. Avant de vous lancer, renseignez-vous pour éviter les mauvaises surprises. Votre logiciel peut même posséder un scan d'accessibilité intégré pour vous permettre de vérifier avant l'exportation.

En premier lieu, mettez à jour les métadonnées de votre document. Renseignez dans le champ concerné, souvent depuis les options du fichier, le titre et la langue, a minima. En second lieu, adoptez l'habitude d'utiliser les balises : dans les options de mise en page d'un document, par exemple, vous pouvez choisir d'utiliser un modèle de titre. Ces modèles sont personnalisables en fonction de vos choix de design, et reproduisent correctement les tags associés, là où adapter simplement la police et la taille de votre titre en partant d'un simple paragraphe ne permettra pas de se repérer correctement. Lors de l'insertion d'une image, un clic-droit ouvre souvent l'accès vers l'ajout d'un texte alternatif, qui remplace sa fonction pour le public qui ne pourrait pas la voir. De même, un graphique ou un camembert multicolore sans indication visuelle n'est pas très utile si on ne peut pas discerner les couleurs.

Beaucoup de fonctions proposées sont des raccourcis qui, si elles sautent parfois une étape, effacent votre travail d'accessibilité. Par exemple, la fonction "Dessiner un tableau" amène souvent un manque de labellisation du contenu des cellules, le rendant incompréhensible. L'exportation subit le même sort : veillez à passer par le chemin "officiel" plutôt que le chemin officieux (par la boite d'impression), qui peut produire une image au lieu d'un document balisé. Plus vous apportez du soin à l'utilisation de la sémantique, plus votre document final sera correctement balisé à la fin. Et plus vous vous forcez à utiliser ces fonctions, plus naturel et rapide deviendra le geste.

## Réparer quand c'est possible

Heureusement, toutes les situations n'engagent pas la réécriture complète d'un document. Néanmoins, les solutions sont très limitées pour rendre un PDF accessible depuis son format.

* Est-ce que le document d'origine est en votre possession ?

Si le PDF entre vos mains est un document que vous (ou votre équipe) avez écrit, il est possible que vous puissiez corriger la source. Remettez en ordre votre document via votre traitement de texte avant de tenter une nouvelle exportation. L'opération peut être rapide en utilisant les paramètres de style, sélectionner, appliquer à tous…

* Est-ce que vous disposez d'un logiciel de traitement PDF ?

Le marché souffre d'un véritable manque d'options d'accessibilité dans les lecteurs PDF intégrés. Il est parfois possible de modifier les métadonnées de votre document depuis les options, mais concernant le contenu, il n'existe, à ma connaissance, qu'Adobe Acrobat qui est reconnu pour son balisage automatique. Les agents IA ne sont pas (encore) efficaces pour la tâche, mais des alternatives basées sur leurs modèles commencent à voir le jour, comme le logiciel open-source [OpenDataLoader](https://opendataloader.org/docs#why-opendataloader).

* Est-ce que vous pouvez proposer une alternative ?

Je ne suis pas partisane de proposer une alternative à une population visée sous prétexte que leur accorder un accès équitable est une tâche trop compliquée. Néanmoins, il est parfois nécessaire de proposer une alternative, parce qu'avoir une porte différente est mieux que d'être coincé-e face au mur sans pouvoir l'escalader. Dans votre cas, vous pouvez proposer des annexes accessibles à votre PDF (en associant une feuille de calcul pour remplacer un tableau mal balisé, en proposant un document regroupant les descriptions longues des graphiques, en apportant une annexe contenant le sommaire, les titres…).

## Testez par vous-même

Si vous faites vos premiers pas en accessibilité, il est fort à parier que vous ne savez ni par où commencer, ni quels sont les impacts concrets de vos décisions. Mais suivre tous mes conseils à la lettre induit une relecture du second point, et d'enfiler une paire de chaussures différente. Sans tester, vous ne pouvez pas savoir si vos actions sont importantes ou efficaces.

Une fois votre nouveau PDF prêt, vous pouvez le tester par vous-même. C'est l'occasion, peut-être, de faire vos premiers pas avec un lecteur d'écran. Si le temps vous manque, vous pouvez scanner gratuitement vos documents via [AxeCheck](https://check.axes4.com/en) ou un autre outil d'accessibilité PDF (lisez les conditions, et attention à vos données), mais un scan automatisé demande toujours des vérifications manuelles. Si vous utilisez des fonctions Text-To-Speech, vérifier le balisage par ce biais est aussi un moyen de vérifier la navigation, quand le logiciel le permet. Enfin, votre lecteur de document peut déjà vous donner des indications sur son accessibilité, par la fonction Recherche (qui ne peut pas fonctionner si le document a un format d'image), le sommaire… Utiliser la touche Tab dans un document est aussi une claire indication : il permet de naviguer entre les titres, les liens, les contenus… et est utilisé par les technologies d'assistance. Enfin, si vous disposez d'Adobe Acrobat, vous pouvez lancer un scan automatisé avant de valider votre PDF pour distribution.

![Exemple d'illustration démonstrative — à remplacer par une vraie capture d'écran](/assets/img/blog-placeholder-2.svg "Légende de démonstration — remplace-moi par une capture d'écran réelle")

## Qu'est-ce qu'on en retient ?

* Tous les traitements de texte et tous les chemins d'exportation ne mènent pas vers un PDF accessible. Il faut être curieux de ses outils, chercher les options d'accessibilité, et s'assurer de suivre les bons processus. Il faut utiliser la sémantique pour écrire son document, veiller à lui donner un titre et spécifier sa langue, et porter attention aux éléments purement visuels (comme les images qui ont besoin d'un alt texte, et les graphiques difficiles).
* Il est parfois plus facile et/ou rapide de recommencer que de rectifier. Les logiciels qui proposent le balisage sont encore difficiles d'accès, le balisage automatique demande une vérification humaine, et le balisage manuel peut être très chronophage en fonction de la taille du fichier.
* Un PDF correctement balisé a plusieurs fonctions : il peut être lu par les technologies d'assistance, et ainsi devenir accessible aux personnes aveugles, ou sourdes-aveugles. Mais il devient aussi plus pratique à l'utilisation : vous pouvez chercher dans son contenu, utiliser Tab, naviguer via les titres... Si vous pouvez chercher en son sein, ainsi le peuvent les assistants IA et les moteurs de recherche. Il devient aussi compréhensible par vos outils et les fonctions de Text-to-Speech.
