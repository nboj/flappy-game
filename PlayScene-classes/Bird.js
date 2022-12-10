import FlappyState from "./FlappyState";

const States = {
    IDLE: 0,
    ALIVE: 1,
    DEAD: 2,
}

/**
 * This class contains functions for manipulating the state of the player as well as manipulating
 * player movement and animations.
 * @classdesc This is the game object representing the player.
 * @author Christian P. Auman
 * @memberOf module:PlayScene
 * @class
 */
class Bird extends FlappyState {
	/**
	 * Sets up all default values for all class variables
	 * @param scene - the Phaser.Scene object used for adding images/sprites/physics/etc...
	 * @constructor
	 */
    constructor(scene) {
		super(States.IDLE);
        this.scene = scene;
        this.hasJumped = false;
        this.jumpVelocity = -800;
		this.time = 0;
		this.tiltDelayStart = 0;
		this.startPosition = {
			x: 416,
			y: 400
		};
		this.idleAnimDelayStart = 0;
		this.idleAnimOffset = 1;
		this.topBoundry = 0;
		this.bottomBoundry = 0;
		this.startSize = 64
		
		// whenever the death event is invoked, this will call the setDead() method
		window.addEventListener('death', () => {
			this.stopG()
		});
    }
	
	/**
	 * This function is called before anything is drawn on the canvas.
	 * This allows for asset preloading which prevents anything from drawing without
	 * it first loading the asset.
	 * Here it is loading the hit-spritesheet.png image from the assets folder
	 */
    preload() {
		this.scene.load.spritesheet('hit', 'assets/hit-spritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
			startFrame: 0,
			endFrame: 8,
		})
		this.scene.load.spritesheet('bird', 'assets/bird-spritesheet.png', {
			frameWidth: 717,
			frameHeight: 610,
			startFrame: 0,
			endFrame: 3,
		})
    }
	
	/**
	 * This function instantiates a sprite image of a bird and sets up all of the default values.
	 */
	setupBird() {
		this.bird = this.scene.physics.add.sprite(this.startPosition.x, this.startPosition.y, 'bird')
		this.bird.depth = 1000
		this.bird.displayWidth = this.startSize
		this.bird.displayHeight = this.startSize
		this.bird.setOrigin(0.5, 0.5)
		
		/**
		 * setting up the physics for the bird game-object
		 */
		// originally, the bird game-object had a circle collider. However, Phaser's implementation of this
		// certain collider is somewhat poorly designed and will occasionally fall through some pipes.
		// Either that, or I am implementing it improperly which is why it is now using a box collider.
		
		// this.bird.body.setSize(this.bird.body.width - 100, this.bird.body.height - 200)
		// this.bird.body.setOffset(100, 100)
		this.bird.body.collideWorldBounds = true;
		this.scene.physics.world.bounds.bottom = this.bottomBoundry + this.bird.displayHeight / 2.5
		this.bird.body
			.setCircle(Math.round(this.bird.body.sourceWidth / 3), this.bird.body.sourceWidth/4, this.bird.body.sourceWidth/20)
			.setMass(100)
			.setBounce(0, 0)
			.setAccelerationY(-10)
			.setMaxVelocityY(700)
			.setGravityY(2800)
			.setAllowGravity(false)
			.setAllowRotation(true)
			.setDragX(300)
			.setFrictionY(1)
	}
	
	/**
	 * This method is called once and is used to create animations and gameObjects such as the bird.
	 */
    create() {
		// this creates a one shot flap animation for the bird and is used everytime the player jumps
		this.scene.anims.create({
			key: 'fly',
			frames: this.scene.anims.generateFrameNumbers('bird', {frames: [0, 3, 2, 1, 0]}),
			duration: 500,
		})
		
		// this creates an infinite animation which does the same thing as fly, except it repeats on loop until
		// explicitly stopped. This is used for the idle game state before the game starts
		this.scene.anims.create({
			key: 'fly-infinite',
			frames: this.scene.anims.generateFrameNumbers('bird', {frames: [3, 2, 1, 0]}),
			duration: 1000,
			repeat: -1,
		})
		
		// this creates an animation for the hit sprite and its a dust cloud that appears beneath, above, or to the side of the player
		// on any collision that causes death
		this.scene.anims.create({
			key: 'hit-anim',
			frames: this.scene.anims.generateFrameNumbers('hit', {frames: [0, 1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 7, 8]}),
			duration: 800,
		})
		this.createHitSprite()
		this.setupBird()
		this.setupIdle()
    }
	
	/**
	 * The update method is called every frame and if the currentState variable = RUNNING, it calls the
	 * handlePipePool() method to check if pipe needs to be repositioned
	 * and updating the position if needed.
	 */
    update(time, delta) {
		// setting the time class variable to the time given from the Phaser's update method
		this.time = time
		// checking to see if the bird's body has hit a boundary
		this.checkBoundaries()
        if (super.getCurrentState() === States.ALIVE) {
			this.handleTilt(time)
        } else if (super.getCurrentState() === States.DEAD) {
        } else if (super.getCurrentState() === States.IDLE) {
		}
    }
	
	/**
	 * This method is for development purposes and would be removed if the game was going to be
	 * in a production environment. Useful to test the difficulty curve without having to play the game through
	 * @ignore
	 * @private
	 */
	enableGodMode() {
		this.bird.body.setEnable(false)
	}
	
	/**
	 * This method sets up the bird object for it's idle state. It will setup it's looping flying animation,
	 * and will change the currentState class variable to IDLE
	 */
	setupIdle() {
		this.bird.play('fly-infinite')
		this.idleTween = this.scene.tweens.add({
			targets: [this.bird],
			y: `-=${25}`,
			duration: 500,
			ease: 'Sine.easeOut',
			repeat: -1,
			yoyo: true
		})
	}
	
	/**
	 * This method will create a sprite game-object which is used as a feedback animation for when
	 * the bird dies/hits a pipe or the ground.
	 */
	createHitSprite() {
		this.hitSprite = this.scene.add.sprite(0, 0, 'hit')
		this.hitSprite.depth = 100
		this.hitSprite.setOrigin(0.5, 1)
		this.hitSprite.visible = false
	}
	
	/**
	 * This method is for rotating the bird to simulate a more organic movement.
	 * @param time - the time from when the game started.
	 */
	handleTilt(time) {
		// if 600 milliseconds has passed from when the bird last jumped, it will start rotating the
		// bird facing the ground.
		if (time - this.tiltDelayStart > 500) {
			if (this.bird.rotation <= 1) {
				this.bird.rotation += 0.1
				this.bird.body.rotation += 0.1
			}
		// If the bird has jumped and the rotation has not met the max of -0.45, it will rotate the bird
		// back up until it reaches -0.45
		} else {
			if (this.bird.rotation >= -0.45) {
				this.bird.rotation -= 0.2
				this.bird.body.rotation -= 0.2
			}
		}
	}
	
	/**
	 * Do not use this function any longer. This was the original way that the bird animated up and down
	 * in its IDLE state. However, a better more organic implementation of an IDLE state animation has been
	 * set up.
	 * @deprecated
	 * @param time - the time from when the game started and is given from the Phaser update method
	 * @returns {number} - the offset to use either 1 or -1
	 */
	getIdleAnimOffset(time) {
		let difference = time - this.idleAnimDelayStart
		if (difference > 500) {
			if (this.idleAnimOffset === 1) {
				this.idleAnimOffset = -1
			} else if (this.idleAnimOffset === -1) {
				this.idleAnimOffset = 1
			}
			this.idleAnimDelayStart = time
		}
		return this.idleAnimOffset
	}
	
	/**
	 * This method makes sure that whenever the bird hits the floor, it will fire the death event. This used to
	 * also check for the ceiling, however a newer implementation of that feature has been made which uses the default
	 * Phaser physics to automatically prevent the bird from escaping the ceiling.
	 */
	checkBoundaries() {
		if (this.bird.body.onFloor() && super.getCurrentState() !== States.DEAD) {
			window.dispatchEvent(new Event('death'))
		}
	}
	
	/**
	 * In case the bird had to stop animating, this method will kill the current idle animation
	 */
	stopIdleTween() {
		this.idleTween.stop()
	}
	
	
	/**
	 * This method is called whenever the player presses the space-bar. It's named onJump in order to
	 * allow for future implementation of different controls such as a mouse click. This method will
	 * check the current state of the game and if it is IDLE, it will call the initiate and jump methods
	 * to simulate the bird jumping and starts the game loop. If the state is ALIVE, then we know that
	 * the bird is no longer in the IDLE state and therefore will only jump. The last thing that this method
	 * will do is prevent the player from holding down the inputs which would break the game by making it
	 * super easy to navigate the pipes.
	 */
    onJump() {
        if (super.getCurrentState() === States.ALIVE) {
            if (this.hasJumped === false) {
				this.jump()
                this.hasJumped = true
            }
        } else if (super.getCurrentState() === States.IDLE) {
			this.startG()
			this.jump()
			this.hasJumped = true
        }
    }
	
	/**
	 * This method will reset the tilt delay start. It will give the physics body a velocityY, and will play the flap animation
	 */
	jump() {
		this.tiltDelayStart = this.time
		this.bird.body.velocity.y = this.jumpVelocity
		this.bird.play('fly')
		
	}
	
	/**
	 * This method should be called to start the game loop for the bird game-object.
	 * It will set the class variable currentState to ALIVE and will set up the bird
	 * game-object, so it will have gravity, will be able to collide, and will respond to player inputs.
	 */
	startG() {
		super.start()
		this.bird.body.allowGravity = true
		this.bird.anims.stop()
		if (this.idleTween)
			this.stopIdleTween()
	}
	
	/**
	 * This method is called whenever the bird has died by either a collision from the pipes or the floor.
	 * It will set the class variable currentState to DEAD. It will position the hitSprite game-object and will play the hit animation using
	 * the hitSprite game-object.
	 */
	stopG() {
		if (super.getCurrentState() === States.ALIVE && this.bird.body) {
			super.stop()
			this.hitSprite.visible = true
			this.bird.body.setVelocityX(200)
			this.hitSprite.scale = 2
			if (this.bird.body.onWall()) {
				this.hitSprite.setAngle(-90)
				this.bird.body.velocity.x = -200
				this.hitSprite.x = this.bird.x + this.bird.displayWidth / 2
				this.hitSprite.y = this.bird.y
			} else if (this.bird.body.onCeiling()) {
				this.bird.body.setVelocityY(-300)
				this.hitSprite.setAngle(-180)
				this.hitSprite.x = this.bird.x
				this.hitSprite.y = this.bird.y - this.bird.displayHeight / 2
			} else {
				if (this.bird.y >= this.bottomBoundry - 10) {
					this.hitSprite.scale = 2.5
					this.bird.body.velocity.x = 200
				}
				this.hitSprite.setAngle(0)
				this.hitSprite.x = this.bird.x
				this.hitSprite.y = this.bird.y + this.bird.displayHeight / 2
			}
			this.hitSprite.play('hit-anim')
		}
	}
	
	/**
	 * This method is used to reset the bird object to its original position/values. Used
	 * for when the bird has "died"/collided with the floor or a pipe
	 */
	resetG() {
		super.reset()
		this.bird.x = this.startPosition.x
		this.bird.y = this.startPosition.y
		this.bird.body.allowGravity = false
		this.bird.body.velocity.y = 0
		this.bird.body.velocity.x = 0
		this.bird.rotation = 0
		this.hitSprite.visible = false
		this.setupIdle()
	}
	
	
	/**
	 * Whenever the given input has been unpressed, for example, taking finger off of the mouse button, it will set has jumped to false,
	 * allowing the bird to jump again.
	 */
    onJumpRelease() {
		this.hasJumped = false
    } 
}

export default Bird;
