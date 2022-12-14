import FlappyState from "./FlappyState";
import Utils from "../helper-classes/Utils";
import eventsCenter from "./EventsCenter";
import {Difficulty} from "../enums/States";

const States = {
	IDLE: 0,
	RUNNING: 1,
	PAUSED: 2
}

/**
 * @classdesc This class is a usuful tool to manipulate, create, and hide the user interface display.
 * It controls the score, highscore, and all menus in the main game.
 * @author Christian P. Auman
 * @memberOf module:PlayScene
 * @class
 */
class UIManager extends FlappyState {
	constructor(scene, difficulty) {
		super(States.IDLE)
		this.scene = scene
		this.difficulty = difficulty
		this.score = 0
		this.highScore = 0
		// this.scoreText = null
		// this.highScoreText = null
		this.startPos = null
		this.depth = 2000
		
		this.buttonSize = {
			width: 195,
			height: 61
		}
		this.menuSize = {
			width: 348,
			height: 540
		}
		
		this.controlsDialogue = null
		this.tweens = {
			controlsDialogueTween: null,
			scoreTextTween: null,
			highScoreTextTween: null,
		}
	}
	
	/**
	 * preload() is a method that is called at the start which allows for loading images and assets that
	 * are needed in the game before use.
	 */
	preload() {
		window.addEventListener('checkpoint', () => {
			this.addPoint()
		})
		this.scene.load.image('star-particle', '/assets/star-particle.png')
		this.scene.load.image('death-menu', '/assets/death-menu.png')
		this.scene.load.spritesheet('restart-button', 'assets/restart-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: this.buttonSize.height,
			frameWidth: this.buttonSize.width
		})
		this.scene.load.spritesheet('menu-button', 'assets/menu-button.png', {
			startFrame: 0,
			endFrame: 1,
			frameHeight: this.buttonSize.height,
			frameWidth: this.buttonSize.width
		})
	}
	
	/**
	 * creates and initializes the score, highscore, scoretext, and highscoretext gameobjects
	 */
	setupScore() {
		// setting the starting position for the ui to base off of
		this.startPos = {
			x: this.scene.game.canvas.width / 2,
			y: this.scene.game.canvas.height / 4
		}
		// creating the score tet ui
		this.scoreText = this.scene.add.text(this.startPos.x, this.startPos.y, 'a', {
			fontFamily: 'FlappyFont',
			fontSize: '100px',
			strokeThickness: 5,
			stroke: 'black'
		})
		// setting initial values for the score text
		this.scoreText.depth = this.depth
		this.scoreText.setOrigin(0.5, 0.5)
		// updating the value and position of the score text
		this.updateScoreText()
		// creating the highscore text ui
		this.highScoreText = this.scene.add.text(this.startPos.x, this.startPos.y, 'a', {
			fontFamily: 'FlappyFont',
			fontSize: '50px',
			strokeThickness: 5,
			stroke: 'black'
		})
		// setting up the initial values for the highscore text ui
		this.highScoreText.depth = this.depth
		this.highScoreText.setOrigin(0.5, 0.5)
		// initial size for the score text
		this.scoreSize = {
			width: this.scoreText.displayWidth,
			height: this.scoreText.displayHeight
		}
		// updating the value and position of the highscore text
		this.updateHighScoreText()
	}
	
	setupControlsDialogue() {
		this.controlsDialogue = this.scene.add.text(this.scene.game.canvas.width / 2, this.scene.game.canvas.height / 2, 'PRESS SPACE TO JUMP...', {
			fontFamily: 'FlappyFont',
			fontSize: '50px'
		})
		this.controlsDialogue.depth = this.depth
		this.controlsDialogue.setOrigin(0.5, 0.5)
		this.showControlsDialogue(150)
	}
	
	setupDeathMenu() {
		const BUTTON_OFFSET = 10
		const BUTTON_GROUP_BOTTOM_PADDING = (this.menuSize.width - this.buttonSize.width) / 2
		this.deathMenu = this.scene.add.image(this.scene.game.canvas.width / 2, this.scene.game.canvas.height / 2, 'death-menu')
			.setOrigin(0.5, 0.5)
			.setScale(0)
			.setAlpha(0)
			.setDepth(this.depth)
		this.menuButton = this.scene.add.sprite(this.deathMenu.x, this.deathMenu.y + this.menuSize.height / 2 - this.buttonSize.height  - BUTTON_GROUP_BOTTOM_PADDING, 'menu-button')
			.setOrigin(0.5, 0)
			.setScale(0)
			.setAlpha(0)
			.setInteractive({cursor: 'pointer'})
			.setDepth(this.depth)
		this.restartButton = this.scene.add.sprite(this.menuButton.x, this.menuButton.y - this.buttonSize.height - BUTTON_OFFSET, 'restart-button')
			.setOrigin(0.5, 0)
			.setScale(0)
			.setAlpha(0)
			.setInteractive({cursor: 'pointer'})
			.setDepth(this.depth)
		this.menuScoreText = this.scene.add.text(this.deathMenu.x, this.deathMenu.y - this.menuSize.height / 4, '', {
			fontFamily: 'FlappyFont',
			fontSize: '50px',
			strokeThickness: 5,
			stroke: 'black'
		})
			.setOrigin(0.5, 1)
			.setDepth(this.depth + 3)
		this.menuScoreText.setPosition(this.menuScoreText.x, this.menuScoreText.y + this.menuScoreText.displayHeight / 2)
			.setAlpha(0)
			.setScale(0)
		this.menuHighScoreText = this.scene.add.text(this.menuScoreText.x, this.menuScoreText.y + 100, '', {
			fontFamily: 'FlappyFont',
			fontSize: '50px',
			strokeThickness: 5,
			stroke: 'black'
		})
			.setOrigin(0.5, 1)
			.setDepth(this.depth + 3)
			.setAlpha(0)
			.setScale(0)
	}
	
	create() {
		this.setupScore()
		this.setupControlsDialogue()
		this.setupDeathMenu()
		this.particleManager = this.scene.add.particles('star-particle')
		this.starEmmiter = this.createStars(this.scoreText, {})
		this.menuHighScoreText.setOrigin(0.5, 0.5)
			.setScale(1)
		this.menuStarEmmiter = this.createStars(this.menuHighScoreText, {frequency: 150, scale: {min: 0.05, max: 0.3}})
		this.menuHighScoreText
			.setScale(0)
		this.particleManager.depth = 10001
		this.tweens.scoreTextTween = this.fadeScaleAnim(this.scoreText, {x: this.scene.game.canvas.width / 2 - this.scoreText.displayWidth / 4, delay: 0})
		this.tweens.highScoreTextTween = this.fadeScaleAnim(this.highScoreText, {x: this.scene.game.canvas.width / 2 - this.highScoreText.displayWidth / 4, delay: 100})
	}
	
	createStars(text, {y=0, frequency=100, scale={min: 0.1, max: 0.5}}) {
		return this.particleManager.createEmitter({
			speed: 20,
			lifespan: 500,
			alpha: {start: 1, end: 0},
			scale: scale,
			on: false,
			y: y,
			frequency: frequency,
			quantity: 3,
			blendMode: 'ADD',
			emitZone: {type: 'random', source: this.getSource(text)}
		})
	}
	
	getSource(text) {
		return {getRandomPoint: function(vec) {
			let x = 0
			let y = 0
			let alpha = 0
			do {
				x = Phaser.Math.RND.between(0, text.displayWidth - 10)
				y = Phaser.Math.RND.between(0, text.displayHeight - 10)
				alpha = text.texture.getPixel(x, y).alpha
			} while(alpha <= 0.9)
			return vec.setTo(x + text.x - text.displayWidth / 2, y + text.y - text.displayHeight / 2)
		}}
	}
	
	setScore(score) {
		this.score = score
		this.updateScoreText()
	}
	
	updateScoreText() {
		this.scoreText.setText(this.score + '')
		// this.scoreText.x = this.startPos.x
	}
	
	setHighScore(score) {
		this.highScore = score
		this.updateHighScoreText()
	}
	
	updateHighScoreText() {
		this.highScoreText.setText(this.highScore + "")
		this.highScoreText.x = this.startPos.x
		this.highScoreText.y = this.startPos.y + this.scoreSize.height * .9
	}
	
	startG() {
		super.start()
		if (this.tweens.controlsDialogueTween)
			this.tweens.controlsDialogueTween.remove()
		this.tweens.controlsDialogueTween = this.fadeScaleAnim(this.controlsDialogue, {
			duration: 1000,
			x: this.scene.game.canvas.width / 2 - this.controlsDialogue.displayWidth / 2,
			from: {
				alpha: 1,
				scale: 1,
			},
			to: {
				alpha: 0,
				scale: 0,
				direction: '+',
				
			}
		})
		this.tweens.controlsDialogueTween.on('complete', () => {
			this.controlsDialogue.visible = false
			this.tweens.controlsDialogueTween.remove()
		})
	}
	
	stopG() {
		if (this.currentState != States.PAUSED) {
			super.stop()
			if (this.score > this.highScore) {
				this.setHighScore(this.score)
				if (!this.menuStarEmmiter.on) {
					this.menuStarEmmiter.visible = true
					this.menuStarEmmiter.start()
				}
				this.setRainbowTint(this.menuHighScoreText)
			} else {
				this.resetColor(this.menuHighScoreText)
			}
			this.starEmmiter.stop()
			this.starEmmiter.visible = false
			this.menuHighScoreText.setText(this.highScore)
			this.menuScoreText.setText(this.score)
			Utils.scaleOut(this.scene, {duration: 1000}, this.scoreText)
			Utils.scaleOut(this.scene, {duration: 1000}, this.highScoreText)
			Utils.scaleIn(this.scene, {delay: 200}, null, this.deathMenu, this.restartButton, this.menuButton, this.menuScoreText)
			Utils.scaleIn(this.scene, {delay: 200, scale: this.score > this.highScore?1.5:1}, null, this.menuHighScoreText)
			this.scene.input.once('gameobjectdown', (pointer, objectHit) => {
				if (objectHit === this.restartButton) {
					this.restartButton.setFrame(1)
				} else if (objectHit === this.menuButton) {
					this.menuButton.setFrame(1)
				}
			})
			this.scene.input.once('gameobjectup', (pointer, objectHit) => {
				if (objectHit === this.restartButton) {
					this.restartButton.setFrame(0)
					setTimeout(() => {
						window.dispatchEvent(new Event('reset'))
					}, 200)
				} else if (objectHit === this.menuButton) {
					this.menuButton.setFrame(0)
					eventsCenter.emit('loadscene', {sceneToLoad: 'MenuScene', currentScene: this.scene.scene})
				}
				const fadeOut = Utils.scaleOut(this.scene, {duration: 1000}, this.deathMenu, this.restartButton, this.menuButton, this.menuScoreText, this.menuHighScoreText)
			})
		}
	}
	
	resetG() {
		super.reset()
		
		this.menuStarEmmiter.stop()
		this.menuStarEmmiter.visible = false
		this.deathMenu.scale = 0
		this.menuScoreText.scale = 0
		this.menuHighScoreText.scale = 0
		this.menuButton.scale = 0
		this.restartButton.scale = 0
		
		this.starEmmiter.stop()
		this.starEmmiter.visible = false
		this.resetColor(this.scoreText)
		this.setScore(0)
		this.showControlsDialogue()
		this.updateScoreText()
		this.updateHighScoreText()
		
		Utils.scaleIn(this.scene, {}, null, this.highScoreText, this.scoreText)
	}
	
	fadeScaleAnim(text, {delay = 0, duration = 1000, x = 0, easeParams = [4, 3], from={alpha:0, scale: 0.5}, to={alpha: 1, scale: 1, direction: '-'}}) {
		text.alpha = from.alpha
		text.scale = from.scale
		text.visible = true
		const tween =  this.scene.tweens.add({
			targets: [text],
			alpha: to.alpha,
			scale: to.scale,
			delay: delay,
			duration: duration,
			ease: 'Elastic.out',
			easeParams: easeParams
		})
		return tween
	}
	
	bounceAnim(text, {duration=50, delay=0, from={scale: 1}, to={scale: 1.1}}) {
		text.scale = from.scale
		const tween = this.scene.tweens.add({
			targets: [text],
			scale: to.scale,
			duration: duration,
			delay: delay,
			ease: 'Bounce.out',
			yoyo: true
		})
		tween.on('complete', () => {
			tween.remove()
		})
	}
	
	showControlsDialogue(delay=0) {
		this.tweens.controlsDialogueTween = this.fadeScaleAnim(this.controlsDialogue, {
			duration: 1000,
			delay: delay,
		})
	}
	
	addPoint() {
		this.setScore(this.score + 1)
		if (this.score > this.highScore) {
			this.setRainbowTint(this.scoreText)
			if (!this.starEmmiter.on) {
				this.starEmmiter.visible = true
				this.starEmmiter.start()
			}
		} else if (this.score === this.highScore) {
			this.scoreText.setTint(0xf0ffea, 0x2fff00, 0x27491a, 0x98ff72)
		} else {
			const ratio = this.score / this.highScore
			if (ratio < 0.2) {
				this.scoreText.setTint(0x52b788, 0xb7e4c7, 0xb7e4c7, 0x1b4332)
			} else if (ratio < 0.5) {
				this.scoreText.setTint(0x98ff72, 0x98ff72, 0x27491a, 0x27491a)
			} else if (ratio < 0.8) {
				this.scoreText.setTint(0x38b000,0x004b23, 0x9ef01a,  0x007200)
			} else if (ratio < 0.9) {
				this.scoreText.setTint(0x38b000,0x007200, 0x007200,  0x007200)
			}
		}
		this.bounceAnim(this.scoreText, {})
	}
	
	setRainbowTint(text) {
		if (this.difficulty === Difficulty.INSANE) {
			text.setTint(0x2d00f7, 0xf72585, 0x480ca8, 0xff6d00)
		} else if (this.difficulty === Difficulty.HARD) {
			text.setTint(0xff758f, 0xe01e37, 0xff758f, 0xbd1f36)
		} else if (this.difficulty === Difficulty.MEDIUM) {
			text.setTint(0xfcec5d, 0xff5a00, 0xff9500, 0xffe15c)
		} else {
			text.setTint(0xff00ff, 0xffff00, 0x00ff00, 0xff0000)
		}
	}
	
	resetColor(text) {
		text.setTint(0xFFFFFF)
	}
}

export default UIManager
