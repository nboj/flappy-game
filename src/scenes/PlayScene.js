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
        this.velocity = 200
        this.colliders = []
        this.overlaps = []
    }
    
    init(data) {
        this.difficulty = data.difficulty
        console.log(data)
    }
    
    /**
     * This function is called before anything is drawn on the canvas.
     * This allows for asset preloading which prevents anything from drawing without
     * it first loading the asset.
     */
    preload() {
        this.start = false
        this.inputDown = false
        this.currentState = States.IDLE
        this.velocity = 200
        
        // object instantiation
        this.pipeManager = new PipeManager(this, {})
        this.bird = new Bird(this)
        this.floor = new Floor(this, {})
        this.cityscape = new Backdrop(this)
        this.cityscape.velocity = this.velocity
        this.cloudManager = new CloudManager(this)
        this.uiManager = new UIManager(this, this.difficulty)
        
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
        this.cloudManager.verticalOffset = this.floor.getHeight() + this.cityscape.background.displayHeight
        this.cloudManager.create()
        
        
        // UIManager setup
        this.uiManager.create()
        
        // listens for the death event
        window.addEventListener('death', () => {
            this.handleDeath()
        })
        // listens for reset event
        window.addEventListener('reset', () => {
            this.restart()
        })
        
        // input event listeners
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.handleInputDown()
        })
        this.input.keyboard.on('keyup-SPACE', () => {
            this.onSpaceUp()
        })
        this.input.keyboard.on('keyup-UP', () => {
            this.onSpaceUp()
        })
        
        this.setupPipeManager({difficulty: this.difficulty})
        
        // sets up collision checking
        this.handleCollisions()
    
        /** dev only */
        // this.bird.enableGodMode()
    
        /**
         * This is an event listener that will listen for the resetscene event. Once it is fired, if there is an object
         * passed into it, then it means that MenuScene is trying to load to this scene which also means that a difficulty
         * was passed in the parameters. It sets the class difficulty to the given one, and sets up the play scene in order
         * to start the game loop.
         */
        eventsCenter.on('resetscene', (e) => {
            if (e) {
                // setting class difficulty variable
                this.difficulty = e.difficulty
                // setting uiManager difficulty
                this.uiManager.difficulty = this.difficulty
                this.setupPipeManager(e)
                // removing previous collider events
                this.colliders.map(collider => {
                    collider.destroy()
                })
                // removing previous overlap events
                this.overlaps.map(overlap => {
                    overlap.destroy()
                })
                // resetting the arrays for the events
                this.colliders.length = 0
                this.overlaps.length = 0
                // re-instantiating the overlap and collider events
                this.handleCollisions()
                // setup scene for game loop.\
                this.restart()
            }
        })
    }
    
    /**
     * This method will setup the PipeManager object, created in the preloader method, and will set settings for it
     * based on the difficulty passed with the difficulty parameter passed in.
     * @param e - Difficulty that's passed from init or sceneloader
     */
    setupPipeManager(e) {
        this.pipeManager.difficulty = e.difficulty
        const config = {
            pipeCount: 8,
            difficulty: e.difficulty
        }
        if (this.difficulty === Difficulty.EASY) {
            this.velocity = 170
            config.finalHorizontalOffset = 200
            config.verticalOffset = 220
            config.velocityX = -this.velocity
        } else if (this.difficulty === Difficulty.MEDIUM) {
            this.velocity = 200
            config.finalHorizontalOffset = 250
            config.verticalOffset = 200
            config.velocityX = -this.velocity
        } else if (this.difficulty === Difficulty.HARD) {
            this.velocity = 200
            config.finalHorizontalOffset = 220
            config.verticalOffset = 180
            config.horizontalOffset = 350
            config.velocityX = -this.velocity
        } else {
            this.velocity = 300
            config.finalHorizontalOffset = 270
            config.verticalOffset = 170
            config.horizontalOffset = 300
            config.velocityX = -this.velocity
        }
        this.floor.velocity = this.velocity
        this.pipeManager.setConfig(config)
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
        this.cityscape.update(time, delta)
        this.floor.update(time, delta)
        this.cloudManager.update()
        
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
            this.colliders.push(this.physics.add.collider(this.bird.bird, pipe.pipeGroup, (e) => {
                window.dispatchEvent(new Event('death'))
            }, null, this))
            this.overlaps.push(this.physics.add.overlap(this.bird.bird, pipe.checkpoint, () => {
                pipe.handleCheckpointOverlap()
            }))
        })
    }
    
    /**
     * Called whenever the bird collides with the ground or a pipe. This will stop or slow all moving game-objects
     * to give the illusion of movement. And changes the game state.
     */
    handleDeath() {
        if (this.currentState !== States.DEAD) {
            this.currentState = States.DEAD
            this.cameras.main
                .flash(400, 200, 200, 200)
                .shake(300, 0.008)
            this.pipeManager.stopG()
            this.cityscape.stopG()
            this.floor.stopG()
            this.cloudManager.stopG()
            this.uiManager.stopG()
        }
    }
}

export default PlayScene;
