/**
 * @classdesc This class holds useful, reusable methods that any gameobject could use.
 * This class has static methods that can be used anywhere in order to reduce the amount
 * of code written and really helps readability which further helps development.
 * @author Christian P. Auman
 * @class
 */
class Utils {
	/**
	 * This method is used to create an animation for Phaser gameobjects. It creates and returns a Phaser.Tween
	 * and will animate the object's scale and alpha in a way that looks like the object is growing from nothing
	 * which is a useful animation for things like displaying things that have not been displayed yet.
	 * @param scene {Phaser.Scene} - current scene being rendered.
	 * @param delay {number} - amount of time in milliseconds to wait before playing the animation.
	 * @param scale {number} - the scale value to animate to.
	 * @param alpha {number} - the alpha value to animate to.
	 * @param easeParams {Array} - the parameters to customize the feel of the animation.
	 * @param duration {number} - how long the animation will last.
	 * @param from {any} - values to animate from
	 * @param targets {any} - the Phaser gameobjects that will be animated
	 * @returns {Phaser.Tweens.Tween} - the Phaser.Tween object which can be used to create callbacks on animation complete, the destruction of the animation, or for anything that might require access to the animation tween.
	 */
	static scaleIn(scene, {delay=0, scale=1, alpha=1, easeParams=[4, 3], duration=1000, from={scale: 0.5, alpha: 0}}, callback, ...targets) {
		// mapping through all of the targets and setting given values to animate from
		targets.map(item => {
			item.alpha = from.alpha
			item.scale = from.scale
		})
		// creating and returning the Phaser.Tween, using the given values to animate to
		return scene.tweens.add({
			targets: targets,
			scale: scale,
			alpha: alpha,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: easeParams,
				onComplete: callback
		})
	}
	
	/**
	 * This method is used to create an animation for Phaser gameobjects. It creates and returns a Phaser.Tween
	 * and will animate the object's scale and alpha in a way that looks like the object is shrinking
	 * which is a useful animation for things like hiding objects in a nice modern way.
	 * @param scene {Phaser.Scene} - current scene being rendered.
	 * @param delay {number} - amount of time in milliseconds to wait before playing the animation.
	 * @param scale {number} - the scale value to animate to.
	 * @param alpha {number} - the alpha value to animate to.
	 * @param easeParams {Array} - the parameters to customize the feel of the animation.
	 * @param duration {number} - how long the animation will last.
	 * @param from {any} - values to animate from
	 * @param targets {any} - the Phaser gameobjects that will be animated
	 * @returns {Phaser.Tweens.Tween} - the Phaser.Tween object which can be used to create callbacks on animation complete, the destruction of the animation, or for anything that might require access to the animation tween.
	 */
	static scaleOut(scene, {delay=0, scale=0, alpha=0, easeParams=[4, 3], duration=1000, from={scale: 1, alpha: 1}}, ...targets) {
		// mapping through all of the targets and setting given values to animate from
		targets.map(item => {
			item.alpha = from.alpha
			item.scale = from.scale
		})
		// creating and returning the Phaser.Tween, using the given values to animate to
		return scene.tweens.add({
			targets: targets,
			scale: scale,
			alpha: alpha,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: easeParams
		})
	}
	
	static scale(scene, {delay=0, scaleX=0, scaleY=scaleX, easeParams=[4, 3], duration=1000, ease='Sine.easeOut'}, ...targets) {
		return scene.tweens.add({
			targets: targets,
			delay: delay,
			scaleX: scaleX,
			scaleY: scaleY,
			duration: duration,
			ease: ease,
			easeParams: easeParams
		})
	}
	
	static translateX(scene, {delay=0, x=0, easeParams=[4, 3], duration=1000, ease='Sine.easeOut'}, ...targets) {
		return scene.tweens.add({
			targets: targets,
			delay: delay,
			x: x,
			duration: duration,
			ease: ease,
			easeParams: easeParams
		})
	}
	
	static translateY(scene, {delay=0, y=0, easeParams=[4, 3], duration=1000, ease='Sine.easeOut'}, ...targets) {
		return scene.tweens.add({
			targets: targets,
			delay: delay,
			y: y,
			duration: duration,
			ease: ease,
			easeParams: easeParams
		})
	}
	
	static translate(scene, {delay=0, x=0, y=x, easeParams=[4, 3], duration=1000, ease='Sine.easeOut'}, ...targets) {
		return scene.tweens.add({
			targets: targets,
			delay: delay,
			x: x,
			y: y,
			duration: duration,
			ease: ease,
			easeParams: easeParams
		})
	}
}

export default Utils
