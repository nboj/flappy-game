import FlappyState from "./FlappyState";

const States = {
	IDLE: 0,
	RUNNING: 1,
	PAUSED: 2
}

/**
 * @classdesc - This will create the floor and will move and update the top part to give the illusion of movement in space.
 * This class is used to easily manage and manipulate the floor. It will animate the tilesprite's X position in the update method.
 * @author Christian P. Auman
 * @class
 */
class Floor extends FlappyState {
	/**
	 * Sets up the default values for the class variables
	 * @param scene - this is the current Scene object
	 * @param x - the starting x pos of the floor
	 * @param y - the starting y pos of the floor
	 */
	constructor(scene, {x=0, y=null}) {
		super(States.IDLE)
		this.scene = scene
		this.position = {
			x: x,
			y: y,
		}
		this.velocity = 0
	}
	
	/**
	 * This function is called before anything is drawn on the canvas.
	 * This allows for asset preloading which prevents anything from drawing without
	 * it first loading the asset.
	 */
	preload() {
		this.scene.load.spritesheet('floor', '/assets/floor-top.png', {
			frameHeight: 32,
			frameWidth: 32
		})
		this.scene.load.spritesheet('ground', '/assets/ground.png', {
			frameHeight: 32,
			frameWidth: 32
		})
	}
	
	/**
	 * This method will create the ground and the floor to be displayed on the canvas
	 */
	create() {
		if (!this.position.y)
			this.position.y = this.scene.game.canvas.height
		// ground creation
		const canvasWidth = this.scene.game.canvas.width
		this.ground = this.scene.add.tileSprite(0, 0, canvasWidth, 100, 'ground')
		this.ground.x = canvasWidth / 2
		this.ground.setOrigin(0, 1)
		this.ground.depth = 2000
		
		// floor creation
		this.floor = this.scene.add.tileSprite(0, 0, canvasWidth, 32, 'floor')
		this.floor.x = canvasWidth / 2
		this.floor.setOrigin(0, 1)
		this.floor.depth = 2001
		
		// setting up the initial position
		this.updatePosition()
	}
	
	/**
	 * This method will update the ground and floor using given class position variable
	 */
	updatePosition() {
		this.ground.x =  this.position.x
		this.ground.y =  this.position.y
		this.floor.x = this.position.x
		this.floor.y =  this.position.y - this.ground.displayHeight
	}
	
	/**
	 * This method returns the total height between the floor and the ground
	 * @returns {number} - the total height between the floor and the ground
	 */
	getHeight() {
		return this.ground.displayHeight + this.floor.displayHeight
	}
	
	/**
	 * If the game state is IDLE or RUNNING, it will call velocityToTilePosition. Basically,
	 * It calls it separately in IDLE and RUNNING in case future implementations required different
	 * logic or velocities for each state.
	 */
	update(time, delta) {
		if (this.currentState === States.IDLE) {
			this.floor.tilePositionX += this.velocityToTilePosition(delta)
		} else if (this.currentState === States.RUNNING) {
			this.floor.tilePositionX += this.velocityToTilePosition(delta)
		} else if (this.currentState === States.PAUSED) {
		
		}
	}
	
	/**
	 * Based on the given velocity, this returns a new x position that will animate the tileposition.x
	 * at the same speed that the physics animatets the moving pipes.
	 * @returns {number} - new tile position
	 */
	velocityToTilePosition(delta) {
		return this.velocity * delta / 1000
	}
	
	/**
	 * Called whenever the game starts. Sets the game state to RUNNING
	 */
	startG() {
		super.start()
	}
	
	/**
	 * Called whenever the game ends. Sets the game state to PAUSED
	 */
	stopG() {
		super.stop()
	}
	
	/**
	 * Called whenever the game resets. Sets the game state to IDLE
	 */
	resetG() {
		super.reset()
		this.floor.tilePositionX = 0
	}
}

export default Floor
