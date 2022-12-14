import Phaser from "phaser";

import Bird from '../../PlayScene-classes/Bird'
import Backdrop from "../../PlayScene-classes/Backdrop";
import Floor from "../../PlayScene-classes/Floor";

import eventsCenter from "../../PlayScene-classes/EventsCenter";
import {Difficulty} from '../../enums/States'
import Utils from "../../helper-classes/Utils";
import CharacterCreator from "../../MenuScene-classes/CharacterCreator";

/**
 * @classdesc Main menu scene for the game
 * This class inherits the Scene object from phaser,
 * which allows for use of the methods preload, create, and update.
 * This scene is used for the main menu navigation and animation.
 * @author Christian P. Auman
 * @class
 * @module MenuScene
 */
class MenuScene extends Phaser.Scene {
	constructor() {
		super('MenuScene');
		this.exit = false
		this.difficulty = Difficulty.MEDIUM
		this.difficultyButtonWidth = 160
		this.startBirdSize = 120
		this.playButtonSize = {
			width: 145,
			height: 95
		}
	}
	
	/**
	 * This function is called before anything is drawn on the canvas.
	 * This allows for asset preloading which prevents anything from drawing without
	 * it first loading the asset. Here, the method is also creating new objects from the
	 * actual game which allows for easy reuse of the previously written code and animations
	 */
	preload() {
		// this.sceneLoader = new SceneLoader()
		// this.sceneLoader.preload()
		
		const velocity = 100
		// object instantiation
		this.bird = new Bird(this)
		this.floor = new Floor(this, {x: 0, y: 0})
		this.background = new Backdrop(this)
		this.floor.velocity = velocity
		this.characterCreator = new CharacterCreator(this)
		
		// preloading
		this.load.spritesheet('bird', 'assets/bird-spritesheet.png', {
			frameWidth: 717,
			frameHeight: 610,
			startFrame: 0,
			endFrame: 3,
		})
		this.load.spritesheet('play-button', '/assets/play-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: this.playButtonSize.height,
			frameWidth: this.playButtonSize.width
		})
		this.load.spritesheet('character-button', '/assets/character-selection-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: this.playButtonSize.height,
			frameWidth: this.playButtonSize.width
		})
		this.load.spritesheet('back-button', '/assets/back-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: this.playButtonSize.height,
			frameWidth: this.playButtonSize.width
		})
		this.load.spritesheet('easy-button', '/assets/easy-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: 160,
			frameWidth: this.difficultyButtonWidth
		})
		this.load.spritesheet('medium-button', '/assets/medium-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: 160,
			frameWidth: this.difficultyButtonWidth
		})
		this.load.spritesheet('hard-button', '/assets/hard-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: 160,
			frameWidth: this.difficultyButtonWidth
		})
		this.load.spritesheet('insane-button', '/assets/insane-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: 160,
			frameWidth: this.difficultyButtonWidth
		})
		
		// object preloading calls
		this.bird.preload()
		this.floor.preload()
		this.background.height = this.game.canvas.height * 3
		this.background.startingY = -this.game.canvas.height * 2
		this.background.starCount = 50
		this.background.preload()
		this.characterCreator.preload()
	}
	
	/**
	 * This method is called once and is used to create every game object
	 * that is used for animations and scene backdrop. This method is the main setup for the main menu
	 * and is used to create all the animations and UI the user will view and interact with.
	 */
	create() {
		this.characterCreatorY = -this.game.canvas.height * 1.5
		// setting up title text
		this.titleText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'Flappers', {fontFamily: 'FlappyFont, sans-serif', fontSize: '5.5vw'})
		this.titleText.setShadow(0, 10, '#5e5e5e', 0, false, true)
		this.titleText.setOrigin(0.5, 0.5)
		this.offset = 300
		this.titleText.y -= this.titleText.displayHeight / 2 + this.offset / 2
		
		// object creation
		this.bird.create()
		this.floor.create()
		this.characterCreator.setup({bird: this.bird.bird})
		this.characterCreator.create()
		this.background.create()
		this.background.setPosition(0, this.game.canvas.height - this.floor.getHeight())
		this.floor.ground.displayHeight = this.game.canvas.height
		this.floor.ground.y = this.floor.floor.y + this.floor.ground.displayHeight
		
		// disabling the bird since the user will not be controlling it in the main menu
		// this.bird.bird.body.setEnable(false)
		this.bird.bird.body
			.setCollideWorldBounds(false)
			.setMaxVelocityY(2800)
		// positioning the bird
		this.bird.bird.setOrigin(0.5, 0.5)
		this.bird.bird.x = this.game.canvas.width / 2
		this.bird.bird.y = this.game.canvas.height / 2
		this.bird.bird.displayWidth = this.startBirdSize
		this.bird.bird.displayHeight = this.startBirdSize
		
		const BUTTON_OFFSET = 20
		// play button setup and creation
		this.playButton = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'play-button')
		this.playButton.setOrigin(0.5, 0.5)
		this.playButton.setInteractive({cursor: 'pointer'})
		this.playButton.y += this.titleText.displayHeight / 2 + this.offset / 2
		
		this.backButton = this.add.image(this.bird.bird.x, (this.characterCreatorY + this.game.canvas.height / 4), 'back-button')
			.setDepth(10000)
			.setScale(0)
			.setAlpha(0)
			.setInteractive({cursor: 'pointer'})
		
		/**
		 * Creating difficulty buttons and hiding them to be animatedIn in the future.
		 * @type {Phaser.GameObjects.Sprite}
		 */
		this.easyButton = this.add.sprite(this.playButton.x - this.difficultyButtonWidth - this.difficultyButtonWidth / 2, this.playButton.y, 'easy-button')
			.setScale(0, 0)
			.setAlpha(0)
			.setInteractive({cursor: 'pointer'})
		this.mediumButton = this.add.sprite(this.playButton.x - this.difficultyButtonWidth / 2, this.playButton.y, 'medium-button')
			.setScale(0, 0)
			.setAlpha(0)
			.setInteractive({cursor: 'pointer'})
		this.hardButton = this.add.sprite(this.playButton.x + this.difficultyButtonWidth / 2, this.playButton.y, 'hard-button')
			.setScale(0, 0)
			.setAlpha(0)
			.setInteractive({cursor: 'pointer'})
		this.insaneButton = this.add.sprite(this.playButton.x + this.difficultyButtonWidth + this.difficultyButtonWidth / 2, this.playButton.y, 'insane-button')
			.setScale(0, 0)
			.setAlpha(0)
			.setInteractive({cursor: 'pointer'})
		
		this.playButton.x += - this.playButtonSize.width / 2 - BUTTON_OFFSET / 2
		
		
		// Character creator button setup and creation
		this.characterCustomizationButon = this.add.image(this.game.canvas.width / 2 + this.playButtonSize.width / 2 + BUTTON_OFFSET / 2, this.game.canvas.height / 2, 'character-button')
			.setOrigin(0.5, 0.5)
			.setInteractive({cursor: 'pointer'})
		this.characterCustomizationButon.y += this.titleText.displayHeight / 2 + this.offset / 2
		
		// setting values for the animations to animate from
		this.titleText.alpha = 0
		this.titleText.scale = 0
		
		// whenever the "resetscene" event is called, this callback function will call the restartScene() method
		// if no data was pasted to the callback function. This is because whenever playscene wants to transition to
		// this scene, it will not pass anything to the loadscene function. However, whenever transitioning from this
		// scene to the PlayScene, this scene will pass a difficulty value and this will still be called again. This ensures
		// the scene wont be reset when it shouldn't need to.
		eventsCenter.on('resetscene', (e) => {
			if (!e) {
				this.restartScene()
			}
		})
		
		/**
		 * This.input.on('gameobjectdown') will execute the following callback function
		 * whenever the play button is clicked by the user.
		 */
		this.input.on('gameobjectdown', (pointer, gameobject) => {
			// sets the current frame of the play button to 1, which is an image of the button clicked down
			if (gameobject === this.backButton) {
				this.backButton.setFrame(1)
			}
		})
		/**
		 * this waits for the user to lift off of the button and will reset the button frame back to its original
		 * frame
		 */
		this.input.on('gameobjectup', (pointer, gameobject) => {
			if (gameobject === this.backButton) {
				this.tweens.killAll()
				this.backButton.setFrame(0)
				this.cameras.main.zoomTo(1, 2000, "Sine.easeInOut")
				this.floor.startG()
				this.background.startG()
				Utils.scaleOut(this, {from: {scale: 0.8, alpha: 1}}, this.backButton)
				setTimeout(() => {
					this.cameras.main.pan(this.cameras.main.centerX, this.game.canvas.height / 2, 1500, 'Sine.easeInOut', false, () => {
						this.titleText
							.setScale(0)
							.setAlpha(0)
						this.playButton
							.setScale(0)
							.setAlpha(0)
						this.characterCustomizationButon
							.setScale(0)
							.setAlpha(0)
						this.initiate()
					})
					setTimeout(() => {
						this.bird.bird.play('fly-infinite')
						this.animateBirdIn()
					}, 1300)
				}, 1000)
			}
		})
		// sets up animations and everything for the menu scene.
		this.initiate()
		if(!this.loaded) {
			this.loaded = true
			console.log('innintisn')
			eventsCenter.emit('loaded')
		}
	}
	
	initiate() {
		/**
		 * This creates an animation for the title text game object. It
		 * will animate from 0 opacity and 0 scale, to it's default values.
		 * @type {Phaser.Tweens.Tween}
		 */
		const titleTween = this.tweens.add({
			targets: [this.titleText],
			scale: 1,
			alpha: 1,
			duration: 3000,
			ease: 'Elastic.out',
			easeParams: [1, 1]
		})
		
		/**
		 * This following code will add a looping animation to the title text object
		 * after the first initial animation is completed
		 */
		titleTween.on('complete',() => {
			if (this.titleTween) {
				this.titleTween.stop()
			}
			this.titleTween = this.tweens.add({
				targets: [this.titleText],
				scale: 1.1,
				duration: 1000,
				ease: 'Back.out',
				easeParams: [4, 3],
				loop: -1,
				yoyo: true
			})
		})
		
		// setting up values for the buttons to animate from
		this.playButton.alpha = 0
		this.playButton.scale = 0
		this.characterCustomizationButon.alpha = 0
		this.characterCustomizationButon.scale = 0
		
		/**
		 * This Phaser Tween animates the play button from 0 opacity and scale to
		 * its default values
		 * @type {Phaser.Tweens.Tween}
		 */
		const playButtonTween = this.tweens.add({
			targets: [this.playButton],
			scale: 1,
			alpha: 1,
			duration: 1000,
			delay: 1000,
			ease: 'Elastic.out',
			easeParams: [1, 1]
		})
		const characterCustomizationButtonTween = this.tweens.add({
			targets: [this.characterCustomizationButon],
			scale: 1,
			alpha: 1,
			duration: 1000,
			delay: 1200,
			ease: 'Elastic.out',
			easeParams: [1, 1]
		})
		/**
		 * This section will add a looping animation after the initial
		 * animation is completed.
		 */
		playButtonTween.on('complete', () => {
			this.tweens.add({
				targets: [this.playButton],
				scale: 1.1,
				duration: 1000,
				ease: 'Sine.easeInOut',
				loop: -1,
				yoyo: true
			})
		})
		characterCustomizationButtonTween.on('complete', () => {
			this.tweens.add({
				targets: [this.characterCustomizationButon],
				scale: 1.1,
				duration: 1000,
				ease: 'Sine.easeInOut',
				loop: -1,
				yoyo: true
			})
		})
		/**
		 * This.input.on('gameobjectdown') will execute the following callback function
		 * whenever the play button is clicked by the user.
		 */
		this.input.once('gameobjectdown', (pointer, gameobject) => {
			// sets the current frame of the play button to 1, which is an image of the button clicked down
			if (gameobject === this.playButton || gameobject === this.easyButton || gameobject === this.mediumButton || gameobject === this.hardButton || gameobject === this.insaneButton || gameobject === this.characterCustomizationButon) {
				gameobject.setFrame(1)
			}
		})
		/**
		 * this waits for the user to lift off of the button and will reset the button frame back to its original
		 * frame
		 */
		const stopMenuButtonAnimations = (gameobject) => {
			gameobject.setFrame(0)
			playButtonTween.stop()
			characterCustomizationButtonTween.stop()
		}
		this.input.once('gameobjectup', (pointer, gameobject) => {
			if (gameobject === this.playButton) {
				stopMenuButtonAnimations(gameobject)
				const tween = this.animateMenuOut()
				tween.on('complete', () => {
					this.createDifficultyButtons()
				})
			} else if (gameobject === this.characterCustomizationButon) {
				stopMenuButtonAnimations(gameobject)
				this.onCharacterCustomizationButtonHit()
			}
		})
	}
	
	animateMenuOut() {
		return this.tweens.add({
			targets: [this.playButton, this.characterCustomizationButon],
			scale: 0,
			alpha: 0,
			ease: 'Elastic.out',
			duration: 300,
			easeParams: [1, 3]
		})
	}
	
	onCharacterCustomizationButtonHit() {
		const tween = this.animateMenuOut()
		tween.on('complete', () => {
			this.bird.bird.depth = 10000
			this.floor.stopG()
			this.background.stopG()
			this.bird.stopIdleTween()
			const y = -this.game.canvas.height * 1.5
			setTimeout(() => {
				this.cameras.main.pan(this.cameras.main.centerX, y, 2000, 'Sine.easeInOut', false, () => {
				
				})
			}, 2000)
			this.cameras.main.zoomTo(1.2, 2000, "Sine.easeInOut")
			// const birdZoomTween = Utils.scale(this, {duration: 700, scaleX: this.bird.bird.scaleX -0.05, scaleY: this.bird.bird.scaleY -0.05}, this.bird.bird)
			
			// const birdTranslateTween = Utils.translateY(this, {duration: 800, y: "-= 100", ease: 'Sine.easeInOut', easeParams: [5, 3]}, this.bird.bird)
			this.bird.stopIdleTween()
			this.bird.bird.anims.stop()
			this.animateBirdOut()
			setTimeout(() => {
				this.tweens.killAll()
				Utils.scaleIn(this, {scale: 0.8, delay: 2000}, () => {
					this.backButtonTween = this.oscillate({scale: 0.9}, this.backButton)
				}, this.backButton)
				this.bird.bird.body
					.setAllowGravity(false)
					.setEnable(false)
				this.bird.bird.y = y
				this.bird.bird.x = this.game.canvas.width / 2
				this.bird.bird.angle = 0
				this.bird.bird.setFrame(1)
			}, 2200)
			
		})
	}
	animateBirdIn() {
		this.bird.bird.y = -this.bird.bird.displayHeight / 2
		this.bird.bird.x = this.game.canvas.width / 2 - 200
		this.bird.bird.displayHeight = this.startBirdSize
		this.bird.bird.displayWidth = this.startBirdSize
		const tween = Utils.translateY(this, {y: this.game.canvas.height / 2, ease: 'Back.out', easeParams: [1, 1]}, this.bird.bird)
		const tween2 = Utils.translateX(this, {x: this.game.canvas.width / 2, ease: 'Sine.easeInOut', easeParams: [3, 1]}, this.bird.bird)
		tween.on('complete', () => {
			this.bird.setupIdle()
		})
	}
	
	/**
	 * Moved to a method in order to reuse this segment of code. This will setup all of the difficulty button values,
	 * and will animate each one in with a certain delay. After those animations complete, it will animate the buttons
	 * scaling up and down for an idle animation. This also sets up a callback function thats called whene the user
	 * clicked on one of the buttons
	 */
	createDifficultyButtons() {
		// setting default values for each button
		this.easyButton.alpha = 0
		this.easyButton.scale = 0
		this.mediumButton.alpha = 0
		this.mediumButton.scale = 0
		this.hardButton.alpha = 0
		this.hardButton.scale = 0
		this.insaneButton.alpha = 0
		this.insaneButton.scale = 0
		
		// animating each button in with an incremented delay to create a chain animation
		let easyTween = this.scaleIn({delay: 0}, this.easyButton)
		let mediumTween = this.scaleIn({delay: 100}, this.mediumButton)
		let hardTween = this.scaleIn({delay: 200}, this.hardButton)
		let insaneTween = this.scaleIn({delay: 300}, this.insaneButton)
		
		// after each button completes it's animation, it will create a new oscillation animation independent to each button
		easyTween.once('complete', () => {
			easyTween = this.oscillate({}, this.easyButton)
		})
		mediumTween.once('complete', () => {
			mediumTween = this.oscillate({}, this.mediumButton)
		})
		hardTween.once('complete', () => {
			hardTween = this.oscillate({}, this.hardButton)
		})
		insaneTween.once('complete', () => {
			insaneTween = this.oscillate({}, this.insaneButton)
		})
		
		/**
		 * If user's mouse or input device is down on a gameobject that is interactable, the callback method is called
		 * which sets the texture's frame to a button down texture
		 */
		this.input.once('gameobjectdown', (pointer, gameobject) => {
			gameobject.setFrame(1)
		})
		/**
		 * once the user releases the input on any of the interactable gameobjects, the callback function will be called
		 * and will start the animations required to transition to the next scene
		 */
		this.input.once('gameobjectup', (pointer, gameobject) => {
			gameobject.setFrame(0)
			// stops all current Phaser.Tween animations
			this.tweens.killAll()
			// finding which button was selected and setting the difficulty accordingly
			if (gameobject === this.easyButton) {
				this.difficulty = Difficulty.EASY
			} else if (gameobject === this.mediumButton) {
				this.difficulty = Difficulty.MEDIUM
			} else if (gameobject === this.hardButton) {
				this.difficulty = Difficulty.HARD
			} else {
				this.difficulty = Difficulty.INSANE
			}
			// animation out every button and starting the transition to next scene
			this.scaleOut({}, this.insaneButton)
			this.scaleOut({delay: 100}, this.hardButton)
			this.scaleOut({delay: 200}, this.mediumButton)
			this.scaleOut({delay: 300}, this.easyButton)
			this.start()
			
		})
	}
	
	/**
	 * DEV ONLY, SHOULD REFACTOR TO USE THE UTILS SCALE IN METHOD
	 * @param delay
	 * @param targets
	 * @returns {Phaser.Tweens.Tween}
	 */
	scaleIn({delay=0}, ...targets) {
		return this.tweens.add({
			targets: targets,
			scale: 1,
			alpha: 1,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: [1, 3]
		})
	}
	/**
	 * DEV ONLY, SHOULD REFACTOR TO USE THE UTILS SCALE OUT METHOD
	 * @param delay
	 * @param targets
	 * @returns {Phaser.Tweens.Tween}
	 */
	scaleOut({delay=0}, ...targets) {
		return this.tweens.add({
			targets: targets,
			scale: 0,
			alpha: 0,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: [1, 1]
		})
	}
	
	/**
	 * DEV ONLY, SHOULD REFACTOR THIS INTO THE UTILS CLASS
	 * @param delay
	 * @param scale
	 * @param easeParams
	 * @param duration
	 * @param targets
	 * @returns {Phaser.Tweens.Tween}
	 */
	oscillate({delay=0, scale=1.05, easeParams=[3, 1], duration=500}, ...targets) {
		return this.tweens.add({
			targets: targets,
			scale: scale,
			delay: delay,
			ease: 'Sine.easeOut',
			easeParams: easeParams,
			duration: duration,
			loop: -1,
			yoyo: true
		})
	}
	
	/**
	 * The update method is called every frame and is used here to update the floor and background to
	 * simulate a parallax movement horizontally
	 * @param time - time since the scene has started
	 * @param delta - time between each frame
	 */
	update(time, delta) {
		if (this.floor.floor && this.background.buildings) {
			this.floor.update(time, delta)
			this.background.update(time, delta)
		}
	}
	
	/**
	 * Starts all required animations to transition to the next scene. Must have all values set to animate
	 * from before calling this method.
	 */
	start() {
		// after 800 milliseconds, the callback function will execute. This will then stop the previous
		// bird animation and sets the frame to a frame displaying the bird wings in the upright position
		this.bird.bird.stop()
		// 100 milliseconds after the previous timeout, this will play a flap animation simulating the bird
		// flying up into the sky
		setTimeout(() => {
			this.bird.bird.play('fly')
		}, 900)
		// This if statement is to make sure that the following code is only executed once
		if (!this.exit) {
			this.exit = true
			/**
			 * This will wait for half the amount of time for the bird animation, and
			 * will start the loading overlay animation. It also tells the SceneLoader to load the next scene
			 */
			setTimeout(() => {
				this.exit = false
				this.tweens.killAll()
				eventsCenter.emit('loadscene', {sceneToLoad: 'PlayScene', currentScene: this.scene, data: {difficulty: this.difficulty}})
			}, 1500)
			this.animateBirdOut()
			/**
			 * this animation will animate out the title text by changing it's opacity and scale to 0
			 */
			this.tweens.add({
				targets: [this.titleText],
				scale: 0,
				alpha: 0,
				duration: 2000,
				ease: 'Elastic.out',
				easeParams: [1, 1]
			})
		}
	}
	
	animateBirdOut() {
		this.bird.bird.setFrame(3)
		setTimeout(() => {
			this.bird.bird.setFrame(0)
		}, 500)
		setTimeout(() => {
			this.bird.bird.setFrame(3)
		}, 1000)
		/**
		 * This animation is the longest animation out of all the other ones and is used as a
		 * way to know when to animate the loading screen. This animation animates the y position
		 * of the bird past the top of the screen after waiting 1 second
		 * @type {Phaser.Tweens.Tween}
		 */
		this.tweens.add({
			targets: [this.bird.bird],
			y: -300,
			duration: 3000,
			delay: 1000,
			ease: 'Elastic.out',
			easeParams: [1, 1]
		})
		
		/**
		 * This animation animates the bird flying upwards one more time before shooting up past the top of the screen
		 * Starts animation after 1 second
		 */
		this.tweens.add({
			targets: [this.bird.bird],
			y: "-= 50",
			duration: 1000,
			delay: 0,
			ease: 'Sine.easeOut',
			easeParams: [3, 1]
		})
		
		/**
		 * This animation will animate the bird flying to the right of the screen. Paired with the previous
		 * animations, this will allow a simulation of the bird flying upwards at a curve.
		 */
		this.tweens.add({
			targets: [this.bird.bird],
			x: this.game.canvas.width / 2 + 200,
			duration: 1000,
			delay: 1000,
			ease: 'Elastic.out',
			easeParams: [1, 1]
		})
		
		/**
		 * This animation will rotate the bird while it is flying upwards
		 */
		this.tweens.add({
			targets: [this.bird.bird],
			angle: -100,
			duration: 1000,
			delay: 1000,
			ease: 'Sine.out',
			easeParams: [1, 1]
		})
	}
	
	/**
	 * This will reset the scene to how it started.
	 */
	restartScene() {
		this.bird.resetG()
		this.bird.bird.x = this.game.canvas.width / 2
		this.bird.bird.y = this.game.canvas.height / 2
		this.bird.angle = 0
		this.bird.bird.play('fly-infinite')
		this.initiate()
	}
}

export default MenuScene
