class Utils {
	static scaleIn(scene, {delay=0, scale=1, alpha=1, easeParams=[4, 3], duration=1000, from={scale: 0.5, alpha: 0}}, ...targets) {
		targets.map(item => {
			item.alpha = from.alpha
			item.scale = from.scale
		})
		return scene.tweens.add({
			targets: targets,
			scale: scale,
			alpha: alpha,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: easeParams
		})
	}
	static scaleOut(scene, {delay=0, scale=0, alpha=0, easeParams=[4, 3], duration=1000, from={scale: 1, alpha: 1}}, ...targets) {
		targets.map(item => {
			item.alpha = from.alpha
			item.scale = from.scale
		})
		return scene.tweens.add({
			targets: targets,
			scale: scale,
			alpha: alpha,
			delay: delay,
			ease: 'Elastic.out',
			easeParams: easeParams
		})
	}
}

export default Utils
