import {Difficulty} from "../enums/States";

/**
 * @classdesc A class that enables easy management and manipulation of a pipe group
 * This class will allow for easy positioning and manipulation of pipes in the
 * flappy bird game. And paired with an array, you can easily create an infinite pool of
 * these PipeGroup objects through recycling
 * @author Christian P. Auman
 * @class
 */
class PipeGroup {
	/**
	 * Setting up default values for the pipe group
	 * @param scene - the scene object from the current scene
	 * @param x - the x position for the pipes
	 * @param y - the y position that the pipes will center from
	 * @param offset - the distance between the top pipe and the bottom pipe
	 * @param velocityX - the speed at which the pipes will move using Phaser's arcade physics
	 */
	constructor(scene, {x=0, y=0, offset=0, velocityX=0, difficulty=Difficulty.MEDIUM}) {
		this.scene = scene
		this.offset = offset
		this.startingOffset = offset
		this.position = {
			x: x,
			y: y
		}
		this.velocityX = velocityX
		this.gotCheckpoint = false
		this.pipeColor = ''
		this.difficulty = difficulty
		if (difficulty === Difficulty.EASY) {
			this.pipeColorChancePicks = ['light-green', 'light-green', 'light-green', 'light-green', 'light-green', 'orange', 'orange']
		} else if (difficulty === Difficulty.MEDIUM) {
			this.pipeColorChancePicks = ['light-green', 'light-green', 'light-green', 'orange', 'orange', 'red']
		} else if (difficulty === Difficulty.HARD) {
			this.pipeColorChancePicks = ['orange', 'orange', 'red']
		} else if (difficulty === Difficulty.INSANE) {
			this.pipeColorChancePicks = ['purple']
		}
	}
	
	preload() {
	}
	
	/**
	 * This method will carry out the creation and setup for each of the pipe and the checkpoint game objects
	 */
	create() {
		// creates a group which allows for easy manipulation of a collection of Phaser Physics game objects
		this.pipeGroup = this.scene.physics.add.group({
			immovable: true,
			allowGravity: false
		})
		
		// creating top pipe
		const tp = this.scene.add.tileSprite(0, 0, 80, this.scene.game.canvas.height, 'pipe')
		this.topPipe = this.scene.physics.add.existing(tp)
		this.topPipe.body.allowGravity = false
		this.topPipe.body.setImmovable(true)
		this.topPipe.displayHeight = this.scene.game.canvas.height
		this.topPipe.setDepth(100)
		
		// creating bottom pipe
		const bp = this.scene.add.tileSprite(0, 0, 80, this.scene.game.canvas.height, 'pipe')
		this.bottomPipe = this.scene.physics.add.existing(bp)
		this.bottomPipe.body.allowGravity = false
		this.bottomPipe.body.setImmovable(true)
		this.bottomPipe.displayHeight = this.scene.game.canvas.height
		this.bottomPipe.setDepth(100)
		
		// creating top cap
		this.topCap = this.scene.physics.add.sprite(0, 0, 'cap')
		this.topCap.body.allowGravity = false
		this.topCap.body.setImmovable(true)
		this.topCap.flipY = true
		this.topCap.setDepth(101)
		this.topCap.displayWidth = this.topPipe.displayWidth - 1
		
		// creating bottom cap
		this.bottomCap = this.scene.physics.add.sprite(0, 0, 'cap')
		this.bottomCap.body.allowGravity = false
		this.bottomCap.body.setImmovable(true)
		this.bottomCap.setDepth(101)
		this.bottomCap.displayWidth = this.bottomPipe.displayWidth - 1
		
		// creating checkpoint
		this.checkpoint = this.scene.physics.add.image(0, 0, '')
		this.checkpoint.displayHeight = this.scene.game.canvas.height
		this.checkpoint.body.velocity.x = this.velocityX
		this.checkpoint.visible = false
		
		// setup group
		this.pipeGroup.add(this.topPipe, true)
		this.pipeGroup.add(this.bottomPipe, true)
		this.pipeGroup.add(this.topCap, true)
		this.pipeGroup.add(this.bottomCap, true)
		
		// updating and setup of initial position and velocity
		this.updatePosition()
		this.updateVelocityX()
	}
	
	/**
	 * This method will reposition each pipe and checkpoint to the newly set position class variable while also
	 * the given offset class variable.
	 */
	updatePosition() {
		// top half
		this.topPipe.y = this.position.y - this.topPipe.displayHeight / 2 - this.offset / 2
		this.topPipe.x = this.position.x + this.topPipe.displayWidth / 2
		this.topCap.y = this.topPipe.y + this.topPipe.displayHeight / 2 - this.topCap.displayHeight / 2
		this.topCap.x = this.topPipe.x
		
		// bottom half
		this.bottomPipe.y = this.position.y + this.bottomPipe.displayHeight / 2 + this.offset / 2
		this.bottomPipe.x = this.position.x + this.bottomPipe.displayWidth / 2
		this.bottomCap.y = this.bottomPipe.y - this.bottomPipe.displayHeight / 2 + this.topCap.displayHeight / 2
		this.bottomCap.x = this.bottomPipe.x
		
		// checkpoint
		this.checkpoint.x = this.topPipe.x
		this.checkpoint.y = this.checkpoint.displayHeight / 2
	}
	
	/**
	 * In case the pipes need to be destroyed for any reason, this method will destroy
	 * and remove every game-object in the current PipeGroup object
	 */
	destroy() {
		this.pipeGroup.destroy()
		this.topPipe.destroy()
		this.topCap.destroy()
		this.bottomPipe.destroy()
		this.bottomCap.destroy()
		this.checkpoint.destroy()
	}
	
	/**
	 * This will be called whenever the bird overlaps the checkpoint and will fire
	 * a checkpoint event for points to be added.
	 */
	handleCheckpointOverlap() {
		// the if statement is here so the event won't be fired every frame the bird is overlapping.
		// if gotCheckpoint is false, it will set it to true and will fire a checkpoint event.
		if (!this.gotCheckpoint) {
			this.gotCheckpoint = true
			window.dispatchEvent(new Event('checkpoint'))
		}
	}
	
	/**
	 * This method handles resetting this current object back to its original values or, whatever values it has currently setup
	 */
	reset() {
		// resets velocity
		this.pipeGroup.setVelocityX(0)
		// disables the moving pipe animations
		this.stopTween()
		// resetting the pipe colors
		this.setPipeColor('')
		// resetting offset
		this.setOffset(this.startingOffset)
	}
	
	/**
	 * This method will set the current pipe's textures using the given color parameter
	 * @param color - the string variable describing the color of the textured pipe that all the pipes in this object will update to.
	 */
	setPipeColor(color) {
		this.pipeColor = color
		this.topPipe.setTexture(`${color?color + '-':''}pipe`)
		this.bottomPipe.setTexture(`${color?color + '-':''}pipe`)
		this.topCap.setTexture(`${color?color + '-':''}cap`)
		this.bottomCap.setTexture(`${color?color + '-':''}cap`)
	}
	
	/**
	 * This method will pick a random color out of the chancePicks array with weighted randomization.
	 * The start of the array will be chosen more often then the end.
	 * @param chancePicks - an array of pipe-colors that the method will pick from with the most common color that will be picked in the start of the array and the least common in the back
	 * @returns {{min: number, max: number}}
	 */
	setupTween(chancePicks) {
		const durations = {
			min: 600,
			max: 1000
		}
		const pick = Phaser.Math.RND.weightedPick(chancePicks)
		this.setPipeColor(pick)
		if (pick === 'light-green') {
			this.setOffset(this.startingOffset + 30)
			durations.min = 1300
			durations.max = 2000
		} else if (pick === 'orange') {
			this.setOffset(this.startingOffset + 25)
			durations.min = 1000
			durations.max = 1300
		} else {
			this.setOffset(this.startingOffset + 20)
			durations.min = 800
			durations.max = 1000
		}
		return durations
	}
	
	/**
	 * If there is no current vertical animation on this object, it will pick a random pipe texture to start with and based on that,
	 * will animate the pipe with the returned durations. However, if there is already an animation, it will see what color it has currently,
	 * and will pick a new color out of the ones that are left. This way adds more complexity to the game as time goes on. By having three different
	 * colors, this object has 3 different difficulties.
	 */
	startVerticalMovement() {
		if (!this.tween) {
			const durations = this.setupTween(this.pipeColorChancePicks)
			this.addTween(durations)
		} else if (this.difficulty === Difficulty.EASY) {
			if (this.pipeColor === 'light-green') {
				const durations = this.setupTween(['orange'])
				this.stopTween()
				this.addTween(durations)
			}
		} else {
			this.stopTween()
			if (this.pipeColor === 'light-green') {
				const durations = this.setupTween(['orange', 'orange', 'orange', 'red'])
				this.addTween(durations)
			} else if (this.pipeColor === 'orange' || this.pipeColor === 'red') {
				const durations = this.setupTween(['red'])
				this.addTween(durations)
			} else {
				const durations = this.setupTween(['purple'])
				this.addTween(durations)
			}
		}
	}
	
	addTween(durations) {
		let ease
		let easeParams = [1, 3]
		if (this.difficulty  === Difficulty.INSANE) {
			ease = 'Sine.easeInOut'
		} else if (this.difficulty === Difficulty.HARD) {
			ease = 'Elastic.inOut'
		} else {
			ease = "Quadratic.easeInOut"
		}
		this.tween = this.scene.tweens.add({
			targets: [this.topPipe, this.bottomPipe, this.topCap, this.bottomCap],
			y: `+=${Phaser.Math.RND.between(100, 150) * Phaser.Math.RND.pick([-1, 1])}`,
			duration: Phaser.Math.RND.between(durations.min, durations.max),
			ease: ease,
			repeat: -1,
			easeParams: easeParams,
			yoyo: true
		})
	}
	
	/**
	 * If there is an animation object on this game-object, this
	 * method will terminate the current animation and will set the
	 * reference to the variable equal to null
	 */
	stopTween() {
		if (this.tween) {
			this.tween.stop()
			this.tween = null
		}
	}
	
	/**
	 * This will set the current offset of the pipe and update the pipes positions
	 * accordingly
	 * @param offset - the offset to animate to
	 */
	setOffset(offset) {
		this.offset = offset
		this.position.x = this.topPipe.x - this.topPipe.displayWidth / 2
		this.updatePosition()
	}
	
	/**
	 * This method will set the class variable velocityX to the given x variable and
	 * will update the physics game-objects in this class accordingly
	 * @param x - the value to set velocityX with
	 */
	setVelocityX(x) {
		this.velocityX = x
		this.updateVelocityX()
	}
	
	/**
	 * This method will set the physics velocityX to the class velocityX value
	 */
	updateVelocityX() {
		this.pipeGroup.setVelocityX(this.velocityX)
		this.checkpoint.body.setVelocityX(this.velocityX)
	}
	
	/**
	 * This method will set the class position variable's x and y to the given x and y values. Then
	 * it will update the pipes positions using those new values accordingly
	 * @param x - x value to position to
	 * @param y - y value to position to
	 */
	setPosition(x, y) {
		this.position.x = x
		this.position.y = y
		this.updatePosition()
	}
	
	/**
	 * Gets and returns the current x and y position of where the current pipe group is located
	 * @returns {{x: number, y: number}}
	 */
	getPosition() {
		return {x: this.topPipe.x, y: this.topPipe.y + this.topPipe.displayHeight/2 + this.offset / 2}
	}
	
	/**
	 * Gets and returns the current width of the PipeGroup
	 * @returns {number}
	 */
	getWidth() {
		return this.topPipe.displayWidth
	}
	
	update() {
	}
	
}

export default PipeGroup
