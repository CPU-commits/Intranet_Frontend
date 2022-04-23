<div class="SpinnerGet">
	<div class="Loader" />
</div>

<style lang="scss">
	.SpinnerGet {
		position: absolute;
		width: 100%;
		height: 4px;
		top: 0;
		overflow: hidden;
	}

	.Loader {
		width: 100%;
		height: 100%;
		position: absolute;
		background: linear-gradient(45deg, #474bff, #d75ee5);
		animation: load 3s ease-in-out infinite;
	}

	@keyframes load {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}
</style>
