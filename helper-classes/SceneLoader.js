import Phaser from "phaser";
import eventsCenter from "../PlayScene-classes/EventsCenter";
import WebFont from "webfontloader";

/**
 *
 * @classdesc
 * @author Christian P. Auman
 * @class
 */
class SceneLoader extends Phaser.Scene {
	constructor() {
		super('SceneLoader')
		this.animateOnLoad = false
		this.startScene = 'MenuScene'
	}
	
	preload() {
		this.scene.bringToTop()
		// preloading
		this.load.image('loading-background', 'assets/loading-background.png')
		
		// event listeners
		eventsCenter.on('loaded', () => {
			this.onLoaded()
		})
		eventsCenter.on('loadscene', (e) => {
			this.loadScene(e)
		})
	}
	
	create() {
		// Webfont.load is used to load a font before executing
		// a block of code
		WebFont.load({
			custom: {
				families: ['FlappyFont']
			},
			// this is what gets called after the font has loaded
			active: () => {
				this.scene.run(this.startScene)
				// loading screen creation (might make a new class for reuse)
				this.overlay = this.add.image(0, 0, 'loading-background')
				this.overlay.setOrigin(0, 0)
				this.overlay.x = -100
				this.overlay.displayWidth = this.game.canvas.width * 1.5
				this.overlay.displayHeight = this.game.canvas.height
				this.overlay.depth = 30000
				
				// loading screen text creation (might make a new class for reuse)
				this.overlayText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'LOADING...', {
					fontFamily: 'FlappyFont, sans-serif',
					fontSize: '5vw'
				})
				this.overlayText.setOrigin(0.5, 0.5)
				this.overlayText.depth = 30001
				
				if (!this.animateOnLoad) {
					this.overlay.x -= this.overlay.displayWidth
					this.overlayText.x = -this.game.canvas.width
				}
			}
		})
	}
	
	onLoaded() {
		if (this.animateOnLoad) {
			/**
			 * this animation is the background of the loading screen
			 */
			this.animateOut(this.overlay, {easeParams: [5, 3], onCompleteX: -this.overlay.displayWidth})
			/**
			 * this animation is the loading... text animation with the loading background animation
			 */
			this.animateOut(this.overlayText, {easeParams: [5, 3], onCompleteX: -this.game.canvas.width})
		}
	}
	
	loadScene(e) {
		if (!this.animateOnLoad) {
			this.animateOnLoad = true
		}
		
		const animation = this.animateX(this.overlay, {x: -100, duration: 2000, easeParams: [1, 3]})
		this.animateX(this.overlayText, {x: this.game.canvas.width / 2, duration: 2000, easeParams: [1, 3]})
		
		animation.on('complete', () => {
			this.tweens.killAll()
			e.currentScene.start(e.sceneToLoad, e.data)
		})
	}
	
	animateX(target, {x=0, duration=1500, delay=0, easeParams=[1, 3]}) {
		return this.tweens.add({
			targets: [target],
			x: x,
			duration: duration,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: easeParams
		})
	}
	
	animateOut(target,  {duration=1500, delay=0, easeParams=[1, 3], onCompleteX=-this.game.canvas.width}) {
		const anim = this.tweens.add({
			targets: [target],
			alpha: 0,
			duration: duration,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: easeParams
		})
		anim.on('complete', () => {
			target.x = onCompleteX
			target.alpha = 1
		})
		return anim
	}
}

export default SceneLoader
