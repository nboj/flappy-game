import FlappyState from "./FlappyState";

const States = {
	IDLE: 0,
	RUNNING: 1,
	PAUSED: 2
}

class UIManager extends FlappyState {
	constructor(scene) {
		super(States.IDLE)
		
		this.scene = scene
		this.score = 0
		this.highScore = 0
		this.scoreText = null
		this.highScoreText = null
		this.startPos = null
		
		this.controlsDialogue = null
		this.tweens = {
			controlsDialogueTween: null,
			scoreTextTween: null,
			highScoreTextTween: null,
		}
	}
	
	preload() {
		this.scene.load.image('star-particle', '/assets/star-particle.png')
		window.addEventListener('checkpoint', () => {
			this.addPoint()
		})
	}
	
	setupScore() {
		this.startPos = {
			x: this.scene.game.canvas.width / 2,
			y: this.scene.game.canvas.height / 4
		}
		this.scoreText = this.scene.add.text(this.startPos.x, this.startPos.y, '', {
			fontFamily: 'FlappyFont',
			fontSize: '100px',
			strokeThickness: 5,
			stroke: 'black'
		})
		this.scoreText.depth = 2000
		this.scoreText.setOrigin(0.5, 0.5)
		this.updateScoreText()
		
		this.highScoreText = this.scene.add.text(this.startPos.x, this.startPos.y, '', {
			fontFamily: 'FlappyFont',
			fontSize: '50px',
			strokeThickness: 5,
			stroke: 'black'
		})
		this.highScoreText.depth = 2000
		this.highScoreText.setOrigin(0.5, 0.5)
		this.updateHighScoreText()
	}
	
	setupControlsDialogue() {
		this.controlsDialogue = this.scene.add.text(this.scene.game.canvas.width / 2, this.scene.game.canvas.height / 2, 'PRESS SPACE TO JUMP...', {
			fontFamily: 'FlappyFont',
			fontSize: '50px'
		})
		this.controlsDialogue.depth = 2000
		this.controlsDialogue.setOrigin(0.5, 0.5)
		this.showControlsDialogue(150)
	}
	
	create() {
		this.setupScore()
		this.setupControlsDialogue()
		this.particleManager = this.scene.add.particles('star-particle')
		const source = (scoreText) => ({
			getRandomPoint: function(vec) {
				let x = 0
				let y = 0
				let alpha = 0
				do {
					x = Phaser.Math.RND.between(0, scoreText.displayWidth - 10)
					y = Phaser.Math.RND.between(0, scoreText.displayHeight - 10)
					alpha = scoreText.texture.getPixel(x, y).alpha
				} while(alpha <= 0.9)
				return vec.setTo(x + scoreText.x - scoreText.displayWidth / 2, y + scoreText.y - scoreText.displayHeight / 2)
			}
		})
		this.starEmmiter = this.particleManager.createEmitter({
			speed: 10,
			lifespan: 500,
			alpha: {start: 1, end: 0},
			scale: {min: 0.1, max: 0.4},
			on: false,
			frequency: 100,
			quantity: 3,
			blendMode: 'ADD',
			emitZone: {type: 'random', source: source(this.scoreText)}
		})
		this.particleManager.depth = 10001
		this.tweens.scoreTextTween = this.fadeScaleAnim(this.scoreText, {x: this.scene.game.canvas.width / 2 - this.scoreText.displayWidth / 4, delay: 0})
		this.tweens.highScoreTextTween = this.fadeScaleAnim(this.highScoreText, {x: this.scene.game.canvas.width / 2 - this.highScoreText.displayWidth / 4, delay: 100})
	}
	
	setScore(score) {
		this.score = score
		this.updateScoreText()
	}
	
	updateScoreText() {
		this.scoreText.text = this.score
		this.scoreText.x = this.startPos.x
	}
	
	setHighScore(score) {
		this.highScore = score
		this.updateHighScoreText()
	}
	
	updateHighScoreText() {
		this.highScoreText.text = this.highScore
		this.highScoreText.x = this.startPos.x
		this.highScoreText.y = this.startPos.y + this.scoreText.displayHeight * .9
	}
	
	resetG() {
		super.reset()
		
		this.starEmmiter.stop()
		this.starEmmiter.visible = false
		
		this.scoreText.style.color = '#fff'
		if (this.score > this.highScore) {
			this.setHighScore(this.score)
		}
		this.setScore(0)
		this.showControlsDialogue()
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
		super.stop()
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
			this.scoreText.style.setColor("#f5ff00")
			if (!this.starEmmiter.on) {
				this.starEmmiter.visible = true
				this.starEmmiter.start()
			}
		} else if (this.score === this.highScore) {
			this.scoreText.style.setColor("#2fff00")
		} else {
			const ratio = this.score / this.highScore
			if (ratio < 0.2) {
				this.scoreText.setColor("#f0ffea")
			} else if (ratio < 0.5) {
				this.scoreText.setColor("rgb(221,255,204)")
			} else if (ratio < 0.8) {
				this.scoreText.setColor("rgb(180,253,152)")
			} else if (ratio < 0.9) {
				this.scoreText.setColor("#98ff72")
			}
		}
		this.bounceAnim(this.scoreText, {})
	}
}

export default UIManager
