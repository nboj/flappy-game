import Phaser from 'phaser'

class CharacterCreator {
	constructor(scene) {
		this.scene = scene
	}
	
	setup({bird=null, startingBirdColor=0x5bc9e1}) {
		this.bird = bird
		this.startingBirdColor = startingBirdColor
		this.currentBirdColor = startingBirdColor
		this.colorPicker = null
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
				const color = colorPicker.childrenMap.hPalette.childrenMap.paletteCanvas.colorObject
				const HSL = this.RGBToHSL(color.r, color.g, color.b)
				console.log(HSL)
				this.pipelineInstance.setHueRotate(43/355)
				this.pipelineInstance.setSatAdjust(100)
				this.pipelineInstance.setLumAdjust(0.6)
				// const HSL = this.hexToHSL(-value)
				// pipelineInstance.setHueRotate(HSL.h)
				// pipelineInstance.setSatAdjust(HSL.s)
				// pipelineInstance.setLumAdjust(HSL.l)
				// "rgba(255,0,14,1)"
			}
		})
			.layout()
	}
	
	RGBToHSL(r,g,b) {
		// Make r, g, and b fractions of 1
		r /= 255;
		g /= 255;
		b /= 255;
		
		// Find greatest and smallest channel values
		let cmin = Math.min(r,g,b),
			cmax = Math.max(r,g,b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		// Calculate hue
		// No difference
		if (delta == 0)
			h = 0;
		// Red is max
		else if (cmax == r)
			h = ((g - b) / delta) % 6;
		// Green is max
		else if (cmax == g)
			h = (b - r) / delta + 2;
		// Blue is max
		else
			h = (r - g) / delta + 4;
		
		h = Math.round(h * 60);
		
		// Make negative hues positive behind 360°
		if (h < 0)
			h += 360;
		// Calculate lightness
		l = (cmax + cmin) / 2;
		
		// Calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		
		// Multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		
		return {h:h, s:s, l:l}
	}
}

export default CharacterCreator
