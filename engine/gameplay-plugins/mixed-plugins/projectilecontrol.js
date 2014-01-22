"use strict";
var ProjectileControl;

/**
 * The Projectile Control plugin manages projectile updates and dealing damage
 * when the projectile reaches its target (this is projectile-type specific).
 *
 * @constructor
 */
ProjectileControl = function () {
    /**
     * The current map.
     *
     * @type Map
     */
    var map,

    /**
     * The current view renderer.
     *
     * @type View
     */
    view,

    /**
     * The current instance of this plugin.
     *
     * @type ProjectileControl
     */
    instance;

    /**
     * Constructor.
     */
    (function () {
        instance = this;
    }.call(this));

    // override
    this.handleTick = function () {
        var i, projectiles, projectile;
        projectiles = map.getProjectiles();
        for (i = projectiles.length; i--;) {
            projectile = projectiles[i];
            switch (projectile.type) {
                case 0:
                    if (projectile.progress === 0) {
                        affectProjectileTarget(projectile);
                    }
                    break;
                case 1:
                    if (projectile.progress === projectile.duration) {
                        affectProjectileTarget(projectile);
                    }
                    break;
                default:
                    throw new Error("Unsupported projectile type: " +
                            projectile.type);
            }
            if (projectile.progress === projectile.duration) {
                map.removeProjectile(i);
                continue;
            }
            projectile.progress++;
        }
    };

    /**
     * Handler for the <code>gameMapInitialization</code> event. The handler
     * sets the map reference.
     *
     * @param {type} gameMap
     */
    this.onGameMapInitialization = function (gameMap) {
        map = gameMap;
    };

    /**
     * Event handler for the <code>viewReady</vode> event. The handler sets the
     * internal view reference.
     *
     * @param {View} newView The initialized view renderer.
     */
    this.onViewReady = function (newView) {
        view = newView;
    };

    /**
     * Affects the unit or building that is located at the projectile's target
     * tile. It is possible that the original target may have moved away and
     * a different target (or no target) will be affected.
     *
     * @param {Projectile} projectile The projectile to affect its target.
     */
    function affectProjectileTarget(projectile) {
        var atTile;
        atTile = map.getObjectAt(projectile.targetTileX,
                projectile.targetTileY);
        if (!atTile) {
            return;
        }
        atTile.hitpoints = Math.max(0, atTile.hitpoints - projectile.damage);
        if (atTile.hitpoints === 0) {
            if (atTile instanceof Building) {
                map.removeBuilding(atTile);
                view.onBuildingChange(atTile);
                instance.sendEvent("buildingDestroyed", {
                    building: atTile
                });
            } else { // Unit
                atTile.action = 1; // destroyed
                map.updateUnit(atTile);
                view.onUnitChange(atTile);
                instance.sendEvent("unitDestroyed", {
                    unit: atTile
                });
            }
        } else if (atTile instanceof Unit) {
            if ((atTile.player !== projectile.player.id) && !atTile.target) {
                if (atTile.action === 4) { // standing still
                    instance.sendEvent("issueAttackUnitOrder", {
                        units: [atTile],
                        target: projectile.firedBy
                    });
                }
            }
        }
    }
};
ProjectileControl.prototype = new AdvancedMixedPlugin();
