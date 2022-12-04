import Phaser from 'phaser'

import Bird from '../../PlayScene-classes/Bird'
import PipeManager from '../../PlayScene-classes/PipeManager'
import Backdrop from "../../PlayScene-classes/Backdrop";
import Floor from "../../PlayScene-classes/Floor";
import CloudManager from "../../PlayScene-classes/CloudManager";
import UIManager from "../../PlayScene-classes/UIManager";

import eventsCenter from "../../PlayScene-classes/EventsCenter";
import {Difficulty} from "../../enums/States";

const States = {
    IDLE: 0,
    RUNNING: 1,
    DEAD: 2,
}

/**
 * @classdesc - This manages/updates/creates/etc. every object and manager in the game.
 * This class is vital to the game and without it, the game wouldn't run. This class is a child of the Phaser.Scene
 * class which allows for overriding methods such as preload, create, and update. It also allows for easy access of different
 * Phaser objects in the game since it inherits them from the Phaser.Scene class.
 * @author Christian P. Auman
 * @class
 */
class PlayScene extends Phaser.Scene {
    /**
     * Setting up the default values for the class variables
     */
    constructor() {
        super('PlayScene')
        this.start = false
        this.inputDown = false
        this.currentState = States.IDLE
        this.deathDelayStart = null
        this.velocity = 200
    }
    
    init(data) {
        this.difficulty = data.difficulty
    }
    
    /**
     * This function is called before anything is drawn on the canvas.
     * This allows for asset preloading which prevents anything from drawing without
     * it first loading the asset.
     */
    preload() {
        if (this.difficulty === Difficulty.EASY) {
            this.velocity = 170
            this.pipeManager = new PipeManager(this, {pipeCount: 12, velocityX: -this.velocity, finalHorizontalOffset: 200, verticalOffset: 220, difficulty: this.difficulty})
        } else if (this.difficulty === Difficulty.MEDIUM) {
            this.velocity = 200
            this.pipeManager = new PipeManager(this, {pipeCount: 12, velocityX: -this.velocity, finalHorizontalOffset: 250, verticalOffset: 190, difficulty: this.difficulty})
        } else if (this.difficulty === Difficulty.HARD) {
            this.velocity = 200
            this.pipeManager = new PipeManager(this, {pipeCount: 12, velocityX: -this.velocity, finalHorizontalOffset: 300, horizontalOffset: 350, verticalOffset: 180, difficulty: this.difficulty})
        } else {
            this.velocity = 300
            this.pipeManager = new PipeManager(this, {pipeCount: 12, velocityX: -this.velocity, finalHorizontalOffset: 270, horizontalOffset: 300, verticalOffset: 200, difficulty: this.difficulty})
        }
        // object instantiation
        this.bird = new Bird(this)
        this.floor = new Floor(this, {})
        this.cityscape = new Backdrop(this)
        this.cityscape.velocity = this.velocity
        this.cloudManager = new CloudManager(this)
        this.uiManager = new UIManager(this)
        
        // preload calls
        this.bird.preload()
        this.pipeManager.preload()
        this.floor.preload()
        this.cityscape.preload()
        this.cloudManager.preload()
        this.uiManager.preload()
        
    }
    
    /**
     * This method is used to call all the appropriate create methods from all the needed managers and objects
     */
    create() {
        this.floor.create()
        this.updateVelocity()
        
        // bird setup
        this.bird.bottomBoundry = this.game.canvas.height - this.floor.getHeight()
        this.bird.create()
        
        // PipeManager setup
        this.pipeManager.create()
        
        // Background setup
        this.cityscape.create()
        this.cityscape.setPosition(0, this.game.canvas.height - this.floor.getHeight())
        
        // CloudManager setup
        this.cloudManager.verticalOffset = this.floor.getHeight() + this.cityscape.buildings.displayHeight
        this.cloudManager.create()
        
        
        // UIManager setup
        this.uiManager.create()
        
        // listens for the death event
        window.addEventListener('death', () => {
            this.handleDeath()
        })
        
        // input event listeners
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
        this.input.keyboard.on('keyup-SPACE', () => {
            this.onSpaceUp()
        })
        this.input.keyboard.on('keyup-UP', () => {
            this.onSpaceUp()
        })
        
        // sets up collision checking
        this.handleCollisions()
    
        /** dev only */
        // this.bird.enableGodMode()
        
        // Hide the loading overlay
        eventsCenter.emit('loaded')
    }
    
    /**
     * Called whenever the space key is pressed and handles making the bird jump and starting the game
     */
    onSpaceDown() {
        console.log('space down')
        this.bird.onJump()
        if (this.currentState === States.IDLE) {
            this.startGame()
        }
    }
    
    /**
     * Called whenever the space key is released and calls onJumpRelease() from the bird object.
     */
    onSpaceUp() {
        this.bird.onJumpRelease()
        this.inputDown = false
    }
    
    /**
     * This will update the velocity to the velocity class variable for every object that needs to be updated.
     */
    updateVelocity() {
        this.floor.velocity = this.velocity
        this.pipeManager.setVelocityX(-this.velocity)
    }
    
    /**
     * This will check if the spacebar key is currently being pressed down. If true, it will call onSpaceDown()
     * and will set spaceDown to true, so it won't call onSpaceDown() again until the spacebar has been released.
     */
    handleInputDown() {
        if (!this.inputDown && (this.spaceKey.isDown || this.upKey.isDown)) {
            this.inputDown = true
            this.onSpaceDown()
        }
    }
    
    /**
     * The update method is called every frame and is used here to call all the update methods from all the
     * managers and objects that need it. It also determines when the game restarts after death and handles
     * the jumping input checking.
     * @param time - the time passed in milliseconds since the game started.
     * @param delta - the time in-between each frame.
     */
    update(time,delta) {
        this.handleInputDown()
        // calling update methods
        this.bird.update(time, delta)
        this.pipeManager.update(time, delta)
        this.cityscape.update()
        this.floor.update()
        this.cloudManager.update()
        
        if (this.currentState === States.DEAD) {
            if (!this.deathDelayStart)
                this.deathDelayStart = time
            if (time - this.deathDelayStart >= 1000) {
                this.deathDelayStart = null
                this.restart()
            }
        }
        
    }
    
    /**
     * Resetting everything that needs to be reset. Will basically set up everything back to
     * how they all started to complete the game loop.
     */
    restart() {
        this.currentState = States.IDLE
        this.start = false
        this.tweens.killAll()
        this.bird.resetG()
        this.pipeManager.resetG()
        this.cityscape.resetG()
        this.floor.resetG()
        this.cloudManager.resetG()
        this.uiManager.resetG()
    }
    
    /**
     * Starting the game by calling all the start methods needed
     */
    startGame() {
        this.currentState = States.RUNNING
        this.start = true
        this.pipeManager.startG()
        this.cityscape.startG()
        this.floor.startG()
        this.cloudManager.startG()
        this.uiManager.startG()
        
        /**
         * DEV ONLY - checking to ensure no new objects are being created and that the game won't get clouded with unmanaged objects
         */
        console.log(this.children.list.length)
    }
    
    /**
     * this method is only called once and will iterate through every pipe inside the pipe manager, and
     * will assign a collision between the pipe and the bird. This also will assign an overlap event and
     * callback to the bird and the checkpoint to give the player points
     */
    handleCollisions() {
        this.pipeManager.pipes.map(pipe => {
            this.physics.add.collider(this.bird.bird, pipe.pipeGroup, (bird, pipe) => {
                console.debug('Bird overlapX=%.1f, overlapY=%.1f, overlapR=%.1f, vx=%.1f, vy=%.1f', bird.body.overlapX, bird.body.overlapY, bird.body.overlapR, bird.body.velocity.x, bird.body.velocity.y)
                const intersects = this.physics.world.intersects(bird.body, pipe.body)
                // This will probably fail if overlapR > 0
                // If it fails when overlapR === 0 then you might increase overlapBias
                console.assert(!intersects, 'Bird should not intersect pipe after collision')
                if (intersects && bird.body.overlapR > 0) {
                    const separation = bird.body.velocity.clone().setLength(bird.body.overlapR)
                    bird.body.position.add(separation)
                    bird.body.updateCenter()
                    console.debug('Reseparate', separation.x, separation.y)
                    // This should pass if the reseparation succeeded
                    console.assert(!this.physics.world.intersects(bird.body, pipe.body), 'Bird should not intersect pipe after reseparation')
                }
                window.dispatchEvent(new Event('death'))
            }, null, this)
            this.physics.add.overlap(this.bird.bird, pipe.checkpoint, () => {
                pipe.handleCheckpointOverlap()
            })
        })
    }
    
    /**
     * Called whenever the bird collides with the ground or a pipe. This will stop or slow all moving game-objects
     * to give the illusion of movement. And changes the game state.
     */
    handleDeath() {
        this.currentState = States.DEAD
        this.pipeManager.stopG()
        this.cityscape.stopG()
        this.floor.stopG()
        this.cloudManager.stopG()
        this.uiManager.stopG()
    }
}

export default PlayScene;
