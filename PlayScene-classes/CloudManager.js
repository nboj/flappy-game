import FlappyState from "./FlappyState";

const States = {
	IDLE: 0,
	RUNNING: 1,
	PAUSED: 2
}

/**
 * @classdesc - This class is used to manage, update, and setup cloud sprites that animated at different speeds and depths to simulate 3D space.
 * This class implements a custom algorithm that I made to draw clouds that are evenly spaced but also with randomness
 * added on to give a more organic look and feel.
 * @author Christian P. Auman
 * @class
 * @memberOf module:PlayScene
 */
class CloudManager extends FlappyState {
	/**
	 * Setting the default values for the class variables
	 * @param scene - the Phaser.Scene object used for adding images/sprites/physics/etc...
	 */
	constructor(scene) {
		super(States.IDLE)
		this.scene = scene
		this.horizontalSections = 10
		this.verticalSections = 3
		this.startingVelocityX = -15
		this.cloudImageSize = {
			width: 200,
			height: 200,
		}
		this.clouds = []
		this.alphas = [0.7, 0.5, 0.3]
		this.verticalOffset = 0
	}
	
	/**
	 * This function is called before anything is drawn on the canvas.
	 * This allows for asset preloading which prevents anything from drawing without
	 * it first loading the asset.
	 */
	preload() {
		this.scene.load.image('cloud', '/assets/cloud-1.png')
	}
	
	/**
	 * This method is the core feature to drawing the actual clouds. Originally, this method created many
	 * cloud game-objects with each one having their own physics body. However, this way of creating
	 * the clouds I found to be more cpu intensive than I wanted. So I came up with my own way to make it less
	 * of a hassle for the player's computer. I was looking through the Phaser docs and came across a way to actually
	 * create a custom texture dynamically. Then I ended up applying this to my algorithm and in the end, I made it so
	 * the game only has to update 6 different images compared to the 50 I had before. This method of creation can be scaled
	 * infinitely and will have the exact same memory usage if you were to have 6 clouds.
	 */
	setupClouds() {
		// reusable variables for abstraction and re-usability
		const canvasHeight = this.scene.game.canvas.height - this.verticalOffset
		const sectionHeight = canvasHeight / this.verticalSections
		
		// configuration for the final texture size
		const textureConfig = {
			width: this.scene.game.canvas.width,
			height: this.scene.game.canvas.height - this.verticalOffset + this.cloudImageSize.height
		}
		// creating a renderTexture to draw the clouds on
		this.background = this.scene.make.renderTexture(textureConfig)
		this.middleground = this.scene.make.renderTexture(textureConfig)
		this.foreground = this.scene.make.renderTexture(textureConfig)
		
		// start drawing the clouds
		this.background.beginDraw()
		this.middleground.beginDraw()
		this.foreground.beginDraw()
		/**
		 * For however many vertical sections given, it will draw a row at each section.
		 */
		for (let i = 0; i < this.verticalSections; i++) {
			this.drawRow(sectionHeight * i, sectionHeight + sectionHeight * i, this.foreground, this.middleground, this.background)
		}
		// I came across a small bug where the last cloud drawn was being placed on each texture renderer and
		// drawing this empty string fixed the issue
		this.background.draw('')
		this.foreground.draw('')
		this.middleground.draw('')
		// end of drawing
		this.background.endDraw()
		this.foreground.endDraw()
		this.middleground.endDraw()
		
		// deleting whatever was inside the clouds array previously
		this.clouds.length = 0
		
		// saving the texture to the Game's TextureManager which allows for dynamically accessing this new
		// texture from just using a given key - string
		this.background.saveTexture('bgClouds')
		this.middleground.saveTexture('mgClouds')
		this.foreground.saveTexture('fgClouds')
		
		// destroys and removes the render textures from the scene which will be picked up by the garbage collectors
		this.foreground.destroy()
		this.middleground.destroy()
		this.background.destroy()
		this.foreground = null
		this.middleground = null
		this.background = null
		
		/**
		 * Here I am creating images using the new textures I just dynamically made, and giving them each a physics body.
		 * It creates 3 different images. One being the foreground clouds which are the biggest and most visible ones. The next
		 * is the middle ground which is in between the foreground and the background and has a less opacity than the foreground clouds.
		 * The last is the background which is drawn behind the other two images.
		 *
		 * The reason there are 2 iteration is that once a cloud group image has moved a little to the left, there is nothing coming
		 * after it, so it will just be blank space. It creates 2 groups of 3 different images, being the foreground/middleground/background,
		 * and the first group is what the user first sees and the second group is positioned 100% off the canvas to the right. This way it adds
		 * a simulated infinite number of clouds when they get recycled.
		 */
		for (let i = 0; i < 2; i++) {
			this.clouds.push(this.scene.physics.add.image(0, 0, 'fgClouds')
				.setOrigin(0, 0)
				.setPosition((this.scene.game.canvas.width)*i - this.cloudImageSize.width / 2, 0)
				.setDepth(-11)
				.setVelocity(this.startingVelocityX - 5, 0)
			)
			this.clouds.push(this.scene.physics.add.image(0, 0, 'mgClouds')
				.setOrigin(0, 0)
				.setPosition((this.scene.game.canvas.width)*i - this.cloudImageSize.width / 2, 0)
				.setDepth(-12)
				.setVelocity(this.startingVelocityX - 0, 0)
			)
			this.clouds.push(this.scene.physics.add.image(0, 0, 'bgClouds')
				.setOrigin(0, 0)
				.setPosition((this.scene.game.canvas.width)*i - this.cloudImageSize.width / 2, 0)
				.setDepth(-13)
				.setVelocity(this.startingVelocityX + 5, 0)
			)
		}
	}
	
	/**
	 * This method is the core piece to the algorithm for creating the clouds. This method is used to create, position, and draw the clouds to
	 * the renderTextures. I basically implemented my own grid and randomly placed each cloud inside that grid cell. It will randomly pick which
	 * renderTexture it draws to using a weighted random pick out of an array.
	 * @param minY - the minimum y position the cloud will draw to
	 * @param maxY - the maximum y position the cloud will draw to
	 */
	drawRow(minY, maxY) {
		// reusable variables for abstraction and re-usability
		const canvasWidth = this.scene.game.canvas.width
		const sectionWidth = canvasWidth / this.horizontalSections
		
		// for however many horizontal sections given, it will draw a cloud inside each section.
		for (let j = 0; j < this.horizontalSections; j++) {
			
			// creating a new cloud game-object
			const cloud = this.scene.add.image(0, 0, 'cloud')
			
			// setting up the minimum and maximum x values the cloud could be positioned at
			let minX = sectionWidth * j
			let maxX = sectionWidth + sectionWidth*j
			// if it's the first iteration, it means that the cloud has a chance to be positioned
			// outside the boundaries which would create a cloud that is cutt-off. Therefore, if
			// it is the first iteration, it will alter the minimum x value accordingly
			if (j === 0) {
				minX += this.cloudImageSize.width / 2
			}
			// this if statement is the same as the one above except it is checking to see if it's the
			// last iteration
			if (j === this.horizontalSections - 1) {
				maxX -= this.cloudImageSize.width / 2
			}
			
			// will randomly choose an element from the alphas array with more of a chance to pick the first element than the last one.
			// This way, it allows for more close up clouds than far away clouds or even reverse.
			const alpha = Phaser.Math.RND.weightedPick(this.alphas)
			
			//setting the opacity/alpha of the cloud
			cloud.alpha = alpha
			
			/**
			 * Depending on which alpha the cloud got, it will draw it to its subsequent textureRenderer and will set the scale of the
			 * cloud accordingly
			 */
			if (alpha === this.alphas[2]) {
				cloud.scale = .3
				this.background.draw(cloud, Phaser.Math.RND.between(minX, maxX), Phaser.Math.RND.between(minY, maxY))
			} else if (alpha === this.alphas[1]) {
				cloud.scale = .45
				this.middleground.draw(cloud, Phaser.Math.RND.between(minX, maxX), Phaser.Math.RND.between(minY, maxY))
			} else if (alpha === this.alphas[0]){
				cloud.scale = .6
				this.foreground.draw(cloud, Phaser.Math.RND.between(minX, maxX), Phaser.Math.RND.between(minY, maxY))
			}
			cloud.destroy()
		}
	}
	
	/**
	 * sets up the clouds initially
	 */
	create() {
		this.setupClouds()
	}
	
	/**
	 * This is the core part to the pooling/recycling of the clouds. Once one of the cloud grouped images
	 * is 100% past the left edge of the canvas, it will reposition 100% past the far right edge which gives an illusion
	 * of infinite clouds.
	 */
	update() {
		this.clouds.map(cloudGroup => {
			if (cloudGroup.x <= -cloudGroup.displayWidth) {
				cloudGroup.x = this.scene.game.canvas.width
			}
		})
	}
	
	/**
	 * called at the start of the game. This is for if this class ever needs to execute code at the start of the game
	 */
	startG() {
		super.start()
	}
	
	/**
	 * called at the end of the game or death. This will set the state to PAUSED and then maps through
	 * each cloud group and sets the velocity to -5 giving a much slower movement since the player will no
	 * longer be moving forward because they have died
	 */
	stopG() {
		super.stop()
		this.clouds.map(cloud => {
			cloud.body.velocity.x = -5
		})
	}
	
	/**
	 * called whenever the game state changes from dead/paused to idle. This resets everything including the positions of the clouds
	 * and creates new textures to use giving more variability to the game.
	 */
	resetG() {
		super.reset()
		this.clouds.map(cloud => {
			cloud.destroy(true)
		})
		this.clouds.length = 0
		this.setupClouds()
	}
}

export default CloudManager
