import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene'
import PlayScene from './scenes/PlayScene'
import SceneLoader from "../helper-classes/SceneLoader";
import Preload from "./scenes/Preload";
import * as UIPlugin from '../helper-classes/rexuiplugin.min.js';

/**
 * This is a configuration object for the actual game and it's properties.
 * @type {{backgroundColor: string, physics: {default: string, arcade: {}}, width: number, scale: {mode: number, autoCenter: number}, type: number, height: number, scene: (MenuScene|PlayScene)[]}}
 */
const config = {
    width: window.innerWidth,
    height: window.innerHeight,
    type: Phaser.AUTO,
    backgroundColor: "#0b4272",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            overlapBias: 10
        }
    },
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        },
            // ...
        ]
    },
    scene: [SceneLoader, MenuScene, PlayScene]
    // scene: [PlayScene]
};

/**
 * Creates a phaser Game object that is crucial to have in order to create and manipulate the canvas element
 * @type {Phaser.Game}
 */
const game = new Phaser.Game(config);

