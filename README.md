# Tower Defense Game
GA: Project 1

[github page: https://justsaykk.github.io/TowerDefense/ ]

Introduction:
Mankind has just found a planet in the goldilocks zone and has spent the day setting up a colony. 
However, as nightfall approaches, the world around awakens and an advanced hostile force starts approaching.

In order to ensure the survival of mankind, the brave has volunteered themselves to brave the invading forces.

Rules of the game:
1) It is possible to place defenders anywhere on the map.
2) Alien Invaders will spawn on the right side of the map and advance towards the left (your base).
3) Stop the alien invaders at all cost.

Game Mechanics:
1) The more defenders defending, the slower they shoot
2) As the night goes on, more and more aliens will attack you



Game design:
Define board with 100 x 100 cell size
Create class for defenders, enemies, projectiles and cells

Cell class: Basically is highlighting the cell that the mouse cursor is on so that
the player can correctly identify what square the player is going to click.

Defenders, Enemies and Projectile classes are very similar. 
All of the classes has a draw function and an update function.

Outside of these classes, there are handler functions. These handler functions are calling back the draw and/or the update functions. 


Files:
1) index.html [ Just holding a canvas ]
2) script.js [ Bulk of game logic & canvas manipulation ]
3) style.css [ defining game background ]