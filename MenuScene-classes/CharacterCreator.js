import Phaser from 'phaser'
import hexToHsl from 'hex-to-hsl'

/**
 * Still under development
 * @author Christian P. Auman
 * @memberOf module:MenuScene
 * @class
 */
class CharacterCreator {
	constructor(scene, useUI=true) {
		this.scene = scene
		this.useUI = useUI
	}
	
	setup({bird=null, startingBirdColor=0x5bc9e1}) {
		this.bird = bird
		this.startingBirdColor = startingBirdColor
		this.currentBirdColor = {
			h: 0,
			s: 0,
			v: 0
		}
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
		if (this.useUI) {
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
					let h = 1-color.h+0.52
					let s = color.s
					let v = color.v
					this.setBirdColor(h, s * 1.5, v * 0.55)
				}
			})
				.layout()
		}
	}
	setBirdColor(h, s, v) {
		this.pipelineInstance.setHueRotate(h)
		this.pipelineInstance.setSatAdjust(s)
		this.pipelineInstance.setLumAdjust(v)
		this.currentBirdColor.h = h
		this.currentBirdColor.s = s
		this.currentBirdColor.v = v
	}
	getBirdColor() {
		return this.currentBirdColor
	}
}

export default CharacterCreator
