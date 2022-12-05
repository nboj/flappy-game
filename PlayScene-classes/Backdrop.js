import Phaser from 'phaser'
import FlappyState from "./FlappyState";

const States = {
	IDLE: 0,
	RUNNING: 1,
	PAUSED: 2
}

/**
 * @classdesc - This sets up, creates, and updates the environment for the game.
 * This class is used to create, manage, and manipulate the environment for the game.
 * @author Christian P. Auman
 * @class
 */
class Backdrop extends FlappyState {
	/**
	 * This will set up all the default values for the class variables
	 * @param scene - the current Scene game object
	 */
	constructor(scene) {
		super(States.IDLE)
		this.scene = scene
		this.position = {
			x: 0,
			y: 0
		}
		this.frameWidth = 640
		this.frameHeight = 256
		this.starCount = 25
		this.buildings = null
		this.trees = null
		this.background = null
		this.velocity = 200
	}
	
	/**
	 * This function is called before anything is drawn on the canvas.
	 * This allows for asset preloading which prevents anything from drawing without
	 * it first loading the asset.
	 */
	preload() {
		// asset injection
		this.scene.load.image('moon', '/assets/moon.png')
		this.scene.load.image('star', '/assets/star.png')
		this.scene.load.spritesheet('buildings', '/assets/cityscape-buildings.png', {
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
		this.scene.load.spritesheet('trees', '/assets/cityscape-trees.png', {
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
		this.scene.load.spritesheet('background', '/assets/cityscape-background.png', {
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
	}
	
	/**
	 * This will update every game object accordingly using the given class position variable
	 */
	updatePosition() {
		this.buildings.x = this.position.x + this.scene.game.canvas.width / 2
		this.buildings.y = this.position.y - this.buildings.displayHeight / 2
		
		this.trees.x = this.position.x + this.scene.game.canvas.width / 2
		this.trees.y = this.position.y - this.trees.displayHeight / 2

		this.background.x = this.position.x + this.scene.game.canvas.width / 2
		this.background.y = this.position.y - this.background.displayHeight / 2
	}
	
	/**
	 * this method will set the class position x and y values to the given x and y parameter values
	 * @param x - x pos
	 * @param y - y pos
	 */
	setPosition(x, y) {
		this.position.x = x
		this.position.y = y
		this.updatePosition()
	}
	
	/**
	 * This is an algorithm that is based off of my cloud algorithm, and at the start of the game will
	 * create a new renderTexture and will draw stars based on a given grid parameter
	 */
	createStars() {
		const horizontalSections = this.starCount / 2
		const verticalSections = this.starCount / 2
		const sceneDimensions = {
			width: this.scene.game.canvas.width,
			height: this.scene.game.canvas.height - 200
		}
		const sectionWidth = sceneDimensions.width / horizontalSections
		const sectionHeight = sceneDimensions.height / verticalSections
		const rt = this.scene.make.renderTexture(sceneDimensions)
		rt.depth = -10001
		rt.beginDraw()
		for (let i = 0; i < verticalSections; i++) {
			for (let j = 0; j < horizontalSections; j++) {
				const x = Phaser.Math.RND.between(sectionWidth * j, sectionWidth * j + sectionWidth)
				const y = Phaser.Math.RND.between(sectionHeight * i, sectionHeight * i + sectionHeight)
				const star = this.scene.add.image(x, y, 'star')
				star.alpha = Phaser.Math.RND.realInRange(0.1, 0.9)
				star.scale = Phaser.Math.RND.realInRange(0.1, 0.5)
				star.setAngle(Phaser.Math.RND.integerInRange(0, 360))
				rt.draw(star)
				star.visible = false
				star.destroy()
			}
		}
		rt.endDraw()
		rt.saveTexture('stars')
	}
	
	/**
	 * This will create tileSprites for the buildings, the trees, and the background. Allows for repeating the image and
	 * the illusion of infinite images
	 */
	createCityscape() {
		this.buildings = this.scene.add.tileSprite(0, 0, this.scene.game.canvas.width, this.frameHeight, 'buildings')
		this.buildings.depth = -101
		
		this.trees = this.scene.add.tileSprite(0, 0, this.scene.game.canvas.width, this.frameHeight, 'trees')
		this.trees.depth = -100
		
		this.background = this.scene.add.tileSprite(0, 0, this.scene.game.canvas.width, this.frameHeight, 'background')
		this.background.depth = -102
		
	}
	
	/**
	 * This calls the needed create/setup methods and also creates a moon image and centers it accordingly
	 */
	create() {
		this.createCityscape()
		
		const canvas = this.scene.game.canvas
		this.moon = this.scene.add.image(canvas.width / 2, canvas.height / 4, 'moon')
		this.moon.depth = -10000
		
		this.createStars()
		this.updatePosition()
	}
	
	/**
	 * This method will update the tile's x position for the trees, buildings, and background.
	 * Depending on how big the number added to the x value is, will determine how fast they move.
	 */
	updateTilePositions(delta) {
		this.background.tilePositionX += this.velocity * 0.0001 * delta
		this.buildings.tilePositionX += this.velocity * 0.0002 * delta
		this.trees.tilePositionX += this.velocity * 0.00035 * delta
	}
	
	/**
	 * This will be updating the tile position for the cityscape if the state is not PAUSED
	 */
	update(time, delta) {
		if (this.currentState === States.IDLE || this.currentState === States.RUNNING) {
			this.updateTilePositions(delta)
		} else if (this.currentState === States.PAUSED) {}
	}
	
	/**
	 * Called at the start of the game
	 */
	startG() {
		super.start()
	}
	
	/**
	 * called at the end of the game
	 */
	stopG() {
		super.stop()
	}
	
	/**
	 * called whenever the game needs to be reset
	 */
	resetG() {
		super.reset()
		this.buildings.tilePositionX = 0
	}
}

export default Backdrop
