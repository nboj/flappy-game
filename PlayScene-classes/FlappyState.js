class FlappyState {
	constructor(currentState) {
		this.currentState = currentState
	}
	start() {
		this.currentState = 1
	}
	stop() {
		this.currentState = 2
	}
	reset() {
		this.currentState = 0
	}
	getCurrentState() {
		return this.currentState
	}
	setCurrentState(value) {
		this.currentState = value
	}
}

export default FlappyState
