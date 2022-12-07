import PipeGroup from "./PipeGroup";
import FlappyState from "./FlappyState";
import {Difficulty} from "../enums/States";

const States = {
	IDLE: 0,
	RUNNING: 1,
	PAUSED: 2,
}


/**
 * @classdesc Allows for easy manipulation and creation of PipeGroup objects.
 * PipeManager is used to create infinite
 * unique scrolling obstacles in the form of pipes that can
 * have a difficulty ramp as well as difficulty settings.
 * @author Christian P. Auman
 * @class
 */
class PipeManager extends FlappyState {
	/**
	 * Sets up all default values for all class variables
	 * @param scene - the Phaser.Scene object used for adding images/sprites/physics/etc...
	 * @param pipeCount - the amount of pipes that gets created
	 * @param horizontalOffset - the distance between sets of pipes on the horizontal axis
	 * @param verticalOffset - the distance between the top and bottom pipe inside a PipeGroup on the vertical axis
	 * @param startingX - where on the canvas on the x-axis the pipes start from
	 * @param velocityX - how fast the collection of pipes move using Phaser's physics
	 * @constructor
	 */
	constructor(scene, {pipeCount=5, finalHorizontalOffset=0, horizontalOffset=finalHorizontalOffset+200, verticalOffset=0, startingX=null, velocityX=0, difficulty=1}) {
		super(States.IDLE)
		this.scene = scene
		this.pipes = []
		this.pipeCount = pipeCount
		this.finalHorizontalOffset = finalHorizontalOffset
		this.currentHorizontalOffset = horizontalOffset
		this.startingHorizontalOffset = horizontalOffset
		this.verticalOffset = verticalOffset
		this.startingX = startingX
		this.initialX = startingX
		this.velocityX = velocityX
		this.currentState = States.IDLE
		this.difficulty = difficulty
		// this.changeOffsetDelayStart = 0
		// this.changeOffsetDelay = changeOffsetDelay
		
		this.checkRecycleDelayStart = 0
		this.checkRecycleDelay = 100

		// this will calculate the number of pipes to draw based on the screen width and the horizontal offset. It adds
		// 2 because it needs one extra to fit the width but also another one as a sort of padding in case the next pipe
		// doesn't recycle exactly on time.
		this.pipeCount = Math.ceil(this.scene.game.canvas.width / (finalHorizontalOffset + 80)) + 2
		console.log(this.pipeCount)
		this.anims = new Array(pipeCount)
		if (this.difficulty === Difficulty.EASY) {
			this.horizontalDecrementAmount = 5
			this.movingPipeChanceArray = [1, 1, 2]
		} else if (this.difficulty === Difficulty.MEDIUM) {
			this.horizontalDecrementAmount = 10
			this.movingPipeChanceArray = [1, 2]
		} else if (this.difficulty === Difficulty.HARD) {
			this.horizontalDecrementAmount = 15
			this.movingPipeChanceArray = [1, 2, 2]
		} else if (this.difficulty === Difficulty.INSANE) {
			this.horizontalDecrementAmount = 20
			this.movingPipeChanceArray = [2]
		}
		console.log(difficulty)
	}
	
	setConfig({pipeCount=5, finalHorizontalOffset=0, horizontalOffset=finalHorizontalOffset+200, verticalOffset=100, startingX=null, velocityX=0, difficulty=1}) {
		this.pipes.map(pipe => {
			pipe.destroy()
		})
		this.pipes.length = 0
		this.pipeCount = pipeCount
		this.finalHorizontalOffset = finalHorizontalOffset
		this.currentHorizontalOffset = horizontalOffset
		this.startingHorizontalOffset = horizontalOffset
		this.verticalOffset = verticalOffset
		this.startingX = startingX
		this.initialX = startingX
		this.velocityX = velocityX
		this.currentState = States.IDLE
		this.difficulty = difficulty
		
		
		// this will calculate the number of pipes to draw based on the screen width and the horizontal offset. It adds
		// 2 because it needs one extra to fit the width but also another one as a sort of padding in case the next pipe
		// doesn't recycle exactly on time.
		this.pipeCount = Math.ceil(this.scene.game.canvas.width / (finalHorizontalOffset + 80)) + 2
		this.anims.map(item => {
			item.destroy()
		})
		this.anims = new Array(pipeCount)
		if (this.difficulty === Difficulty.EASY) {
			this.horizontalDecrementAmount = 5
			this.movingPipeChanceArray = [1, 1, 2]
		} else if (this.difficulty === Difficulty.MEDIUM) {
			this.horizontalDecrementAmount = 10
			this.movingPipeChanceArray = [1, 2]
		} else if (this.difficulty === Difficulty.HARD) {
			this.horizontalDecrementAmount = 15
			this.movingPipeChanceArray = [1, 2, 2]
		} else if (this.difficulty === Difficulty.INSANE) {
			this.horizontalDecrementAmount = 20
			this.movingPipeChanceArray = [2]
		}
		// if no starting value for x was given,
		// it will start the pipes at the far right side of the canvas
		if (!this.startingX) {
			this.startingX = this.scene.game.canvas.width
			this.initialX = this.startingX
		}
		this.preloadCreatePipes()
		this.createPipes()
		
		
	}
	
	/**
	 * This function is called before anything is drawn on the canvas.
	 * This allows for asset preloading which prevents anything from drawing without
	 * it first loading the asset.
	 */
	preload() {
		// preloading assets
		// green pipe
		this.scene.load.image('pipe', '/assets/pipe.png')
		this.scene.load.image('cap', '/assets/pipe-top.png')
		// red pipe
		this.scene.load.image('red-pipe', '/assets/pipe-red.png')
		this.scene.load.image('red-cap', '/assets/pipe-top-red.png')
		// light-green pipe
		this.scene.load.image('light-green-pipe', '/assets/pipe-light-green.png')
		this.scene.load.image('light-green-cap', '/assets/pipe-top-light-green.png')
		// orange pipe
		this.scene.load.image('orange-pipe', '/assets/pipe-orange.png')
		this.scene.load.image('orange-cap', '/assets/pipe-top-orange.png')
		// purple pipe
		this.scene.load.image('purple-pipe', '/assets/pipe-purple.png')
		this.scene.load.image('purple-cap', '/assets/pipe-top-purple.png')
		
		// if no starting value for x was given,
		// it will start the pipes at the far right side of the canvas
		if (!this.startingX) {
			this.startingX = this.scene.game.canvas.width
			this.initialX = this.startingX
		}
		this.preloadCreatePipes()
	}
	
	preloadCreatePipes() {
		// creating PipeGroup objects and adding them to an array that will be used farther down in the code.
		// it's also preloading each PipeGroup for anything that needs done before drawing to canvas.
		for (let i = 0; i < this.pipeCount; i++) {
			const pipe = new PipeGroup(this.scene, {x: this.startingX, y: this.scene.game.canvas.height / 2, offset: this.verticalOffset, difficulty: this.difficulty})
			pipe.preload()
			this.pipes.push(pipe)
		}
	}
	
	getNewPipePosition(pipe, index) {
		// generating new pipe positions x and y
		if (this.currentHorizontalOffset > this.finalHorizontalOffset)
			this.currentHorizontalOffset -= this.horizontalDecrementAmount
		if (this.currentHorizontalOffset < this.finalHorizontalOffset)
			this.currentHorizontalOffset = this.finalHorizontalOffset
		const newX = index===0?this.startingX:this.pipes[index-1].getPosition().x + this.currentHorizontalOffset
		const newY = this.getRandomY()
		return {x: newX, y: newY}
	}
	
	/**
	 * This method dynamically generates positions for each pipe while
	 * taking in account for the horizontal offset given from the constructor
	 * @param pipe - the pipe that is being positioned
	 * @param index - the index of that pipe from an array of pipes
	 */
	setupPipePositions(pipe, index) {
		// resetting the variable gotCheckpoint
		pipe.gotCheckpoint = false
		this.handleMovingPipeChance(pipe)
		const position = this.getNewPipePosition(pipe, index)
		
		// setting those positions while taking into account the starting x position
		pipe.setPosition(position.x, position.y)
	}
	
	/**
	 * This method is called once and is used to create each PipeGroup gameObject
	 * and sets up each pipe's position
	 */
	create() {
		this.createPipes()
		// this.pipes.map((pipe, index) => {
		// 	// calling thee create method from the PipeGroup object
		// 	pipe.create()
		//
		// 	// setting the positions for the pipe
		// 	this.setupPipePositions(pipe, index)
		// })
	}
	
	createPipes() {
		for (let i = 0; i < this.pipes.length; i++) {
			const pipe = this.pipes[i]
			pipe.create()
			this.setupPipePositions(pipe, i)
		}
	}
	
	/**
	 * The update method is called every frame and if the currentState variable = RUNNING, it calls the
	 * handlePipePool() method to check if pipe needs to be repositioned
	 * and updating the position if needed.
	 */
	update(time, delta) {
		if (this.currentState === States.RUNNING) {
			/**
			 * This is the previous implementation of the difficulty curve and it
			 * updated the horizontal offset every number of seconds. the problem was
			 * that the user wouldn't see the new offset until after the 12 PipeGroup objects had first
			 * been recycled which created a weird problem where the offset was getting smaller after each
			 * section of 12 pipes which isn't the way I wanted it designed
			 */
			// if (time - this.changeOffsetDelayStart >= this.changeOffsetDelay && this.currentHorizontalOffset > this.finalHorizontalOffset) {
			// 	this.currentHorizontalOffset -= 1
			// 	if (this.currentHorizontalOffset < this.finalHorizontalOffset) {
			// 		this.currentHorizontalOffset = this.finalHorizontalOffset
			// 	}
			// 	this.changeOffsetDelayStart = time
			// }
			if (time - this.checkRecycleDelayStart > this.checkRecycleDelay) {
				this.checkRecycleDelayStart = time
				this.handlePipePool()
			}
		}
	}
	
	/**
	 * This method checks each of the pipe's position inside the pipes array,
	 * and if the pipe is outside of the canvas, it will reset the pipe back to the
	 * other end of all the other pipes.
	 */
	handlePipePool() {
		// mapping through each PipeGroup object
		for (let i = 0; i < this.pipes.length; i++) {
			const pipe = this.pipes[i]
			// current pipe's position
			const pos = pipe.getPosition()

			// current pipe's width
			const width = pipe.getWidth()

			// if the pipe is beyond the canvas on the left side,
			// the pipe will be repositioned at the end of all the other pipes
			if (pos.x + width / 2 <= 0) {
				this.handleResetPipe(pipe, i)
			}
		}
		// this.pipes.map((pipe, index) => {
		// 	// current pipe's position
		// 	const pos = pipe.getPosition()
		//
		// 	// current pipe's width
		// 	const width = pipe.getWidth()
		//
		// 	// if the pipe is beyond the canvas on the left side,
		// 	// the pipe will be repositioned at the end of all the other pipes
		// 	if (pipe.topPipe.x <= 0) {
		// 	console.log(pipe.topPipe.x)
		// 		this.handleResetPipe(pipe, index)
		// 	}
		// })
	}
	
	/**
	 * This method will take in a PipeGroup object and since this pipe is beyond the canvas,
	 * then we know that it is the first PipeGroup object inside the array. Therefore it will
	 * remove the first element from the PipeGroup array, and appends it to the end. It also
	 * positions the pipe to a new position relative to the previous last element and the
	 * horizontal offset
	 * @param pipe - current pipe being reset
	 */
	handleResetPipe(pipe, index) {
		// removes the first element from the PipeGroup array
		this.pipes.shift()
		// sets the new position for the pipe taking into account the horizontal axis
		this.setupPipePositions(pipe, this.pipes.length)
		// appending the pipe to the end of the PipeGroup array
		this.pipes.push(pipe)
	}
	
	handleMovingPipeChance(pipe) {
		// if the pipe is not being tweened, it will create one which adds more difficulty to the game
		if (Phaser.Math.RND.weightedPick(this.movingPipeChanceArray)==2) {
			pipe.startVerticalMovement()
		}
	}
	
	/**
	 * This function generates a random number on the y-axis by offsetting the middle of the y-axis for
	 * min and max numbers that the random generator uses
	 * @returns {number} - new y position randomly generated to position a pipe on the vertical axis
	 */
	getRandomY() {
		// center of canvas on the y-axis
		const mid = this.scene.game.canvas.height / 2
		// random number generated from min and max. The total area is 351px that a pipe can be positioned on the y-axis
		return Phaser.Math.RND.integerInRange(mid - 200, mid + 150)
	}
	
	/**
	 * This method will change and update the distance between each pipe with the
	 * given newOffset value. This can be used to update the offset mid-game which could
	 * add more complexity to the game
	 * - very cpu intensive and should not be used inside an update method
	 * @param newOffset - the space between each pipe
	 * @deprecated
	 */
	setHorizontalOffset(newOffset) {
		this.currentHorizontalOffset = newOffset
		this.startingX = this.pipes[0].topPipe.x - this.pipes[0].getWidth() / 2
		this.pipes.map((pipe, index) => {
			const pos = this.getNewPipePosition(pipe, index)
			pipe.setPosition(pos.x, pipe.position.y)
		})
	}
	
	/**
	 * This method is used for resetting the pipe's positions and anything else that may have
	 * been altered during the gameplay
	 */
	resetG() {
		// resetting the currentState
		super.reset()
		// resetting the offset
		this.currentHorizontalOffset = this.startingHorizontalOffset
		// resetting startingX
		this.startingX = this.initialX
		// mapping through the PipeGroup array
		this.pipes.map((pipe, index) => {
			pipe.reset()
			// resetting pipes to starting positions
			this.setupPipePositions(pipe, index)
		})
	}
	
	/**
	 * Setter for the velocityX variable
	 * @param velocity - how fast the pipes are moving
	 */
	setVelocityX(velocity) {
		this.velocityX = velocity
		this.pipes.map(pipe => {
			if (pipe.pipeGroup)
				pipe.setVelocityX(velocity)
		})
	}
	
	/**
	 * Starts moving the pipes and updates the currentState to RUNNING
	 * allowing for pipe pooling and one of the main components to start the gameplay
	 */
	startG() {
		super.start()
		this.pipes.map(pipe => {
			pipe.setVelocityX(this.velocityX)
		})
	}
	
	/**
	 * Stops the pipes at their current positions and disables their horizontal velocity.
	 * Also changes the currentState to IDLE
	 */
	stopG() {
		if (this.currentState === States.RUNNING) {
			super.stop()
			this.pipes.map(pipe => {
				pipe.setVelocityX(0)
			})
		}
	}
}

export default PipeManager
