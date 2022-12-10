import Phaser from 'phaser'
import hexToHsl from 'hex-to-hsl'

/**
 * @class
 * @memberOf module:MenuScene
 */
class CharacterCreator {
	constructor(scene) {
		this.scene = scene
	}
	
	setup({bird=null, startingBirdColor=0x5bc9e1}) {
		this.bird = bird
		this.startingBirdColor = startingBirdColor
		this.currentBirdColor = startingBirdColor
		this.colorPicker = null
		this.birdRenderer = this.createBird()
	}
	
	createBird() {
	
	}
	
	preload() {
		this.scene.load.plugin('rexhsladjustpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexhsladjustpipelineplugin.min.js', true);
	}
	
	create() {
		const pipeline = this.scene.plugins.get('rexhsladjustpipelineplugin')
		
		this.pipelineInstance = pipeline.add(this.bird, {
			hueRotate: 0.5		,
			satAdjust: 1,
			lumAdjust: 0.5,
			name: 'rexHslAdjustPostFx'
		});
		this.colorPicker = this.scene.rexUI.add.colorPicker({
			height: 300,
			width: 200,
			value: this.startingBirdColor,
			background: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x212529),
			space: 10,
			x: this.scene.game.canvas.width / 3,
			y: this.scene.characterCreatorY,
			hPalette: {
				size: 16,
			},
			valuechangeCallback: (newValue, oldValue, colorPicker) => {
				const color = colorPicker.childrenMap.svPalette.childrenMap.paletteCanvas.colorObject
				let s = color.s
				let h = 1-color.h+0.52
				let v = color.v
				this.pipelineInstance.setHueRotate(h)
				this.pipelineInstance.setSatAdjust(s * 1.5)
				this.pipelineInstance.setLumAdjust(v *.55)
			}
		})
			.layout()
	}
	
	
}

export default CharacterCreator
