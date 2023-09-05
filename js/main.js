$(document).ready(function() {
	var gameContainer = $('#game-container');
	var ground = $('#ground');
	var player = $('#player');
	var isJumping = false;
	var jumpInterval = null;
	var jumpHeight = 100;
	var jumpDuration = 850;
	var obstacles = [];
	var coins = [];

	var obstacleSpeed = 5;
	var coinSpeed = 5;
	var obstacleInterval = 1800; //2000
	var coinInterval = 1300; // 3000

	var score = 0;
	var distance = 0;
	var distanceInterval = 10;
	
	var coinSound = new Audio("audio/coin.wav");
	var jumpSound = new Audio("audio/jump.mp3");
	var deathSound = new Audio("audio/pop.mp3");
	var gameOverSound = new Audio("audio/death.wav");

	function moveBackground() {
		gameContainer.animate({ backgroundPositionX: '-=5px' }, 18, 'linear', moveBackground);
		ground.animate({ backgroundPositionX: '-=5px' }, 18, 'linear', moveBackground);
	}

	function moveObstacles() {
		for (var i = 0; i < obstacles.length; i++) {
			var obstacle = obstacles[i];
			var obstacleLeft = obstacle.position().left;

			if (obstacleLeft <= 0) {
				obstacle.remove();
				obstacles.splice(i, 1);
				i--;
			} else {
				obstacle.css('left', obstacleLeft - obstacleSpeed + 'px');

				if (isColliding(obstacle, player)) {
					if (player.hasClass('breaking')) {
						obstacle.remove();
						obstacles.splice(i, 1);
						i--;
						score += 5;
						updateScore();
						deathSound.play();
					} else {
						gameOver();
						return;
					}
				}
			}
		}

		setTimeout(moveObstacles, 10);
	}

	function moveCoins() {
		for (var i = 0; i < coins.length; i++) {
			var coin = coins[i];
			var coinLeft = coin.position().left;

			if (coinLeft <= 0) {
				coin.remove();
				coins.splice(i, 1);
				i--;
			} else {
				coin.css('left', coinLeft - coinSpeed + 'px');

				if (isColliding(coin, player)) {
					coin.remove();
					coins.splice(i, 1);
					i--;

					score += 10;
					updateScore();
					coinSound.play();
				}
			}
		}

		setTimeout(moveCoins, 10);
	}

	function isColliding(element1, element2) {
		var element1Pos = element1.position();
		var element2Pos = element2.position();

		var element1Left = element1Pos.left;
		var element1Right = element1Left + element1.width();
		var element1Top = element1Pos.top;
		var element1Bottom = element1Top + element1.height();

		var element2Left = element2Pos.left;
		var element2Right = element2Left + element2.width();
		var element2Top = element2Pos.top;
		var element2Bottom = element2Top + element2.height();

		return (
			element1Left < element2Right &&
			element1Right > element2Left &&
			element1Top < element2Bottom &&
			element1Bottom > element2Top
		);
	}

	function jump() {
		var currentBottom = parseInt(player.css('bottom'));
		var destinationBottom = currentBottom + jumpHeight;
		jumpSound.play();
						
		// Jumping
		$('#player').css('background-image','url(img/jump2.gif)');

		player.animate({ bottom: destinationBottom }, jumpDuration / 2, 'linear', function() {
			player.animate({ bottom: currentBottom }, jumpDuration / 2, 'linear', function() {
				isJumping = false;
				
				// Running
				$('#player').css('background-image','url(img/running2.gif)');
			});
		});
	}
	
	function handleJump() {
		if (!isJumping) {
			isJumping = true;
			jump();
		}
	}
	
	/*
	function handleBreak() {
		player.addClass('breaking');
		setTimeout(function() {
			player.removeClass('breaking');
		}, 500);
	}
	*/
	
	function handleBreak() {
		var abilityButton = $('#attack-btn');

		// Check if the button is already disabled
			if (abilityButton.prop('disabled')) {
			return;
		}

		player.addClass('breaking');
		$('#player').css('background-image','url(img/slide.png)');

		// Disable the button
		abilityButton.prop('disabled', true);

		// Change the background color of the button
		abilityButton.css('background-color', '#888');

		// Set the countdown duration in milliseconds
		var countdownDuration = 5000; // 5 seconds

		// Start the countdown
		var countdown = setInterval(function() {
		// Calculate the remaining time
		var remainingTime = Math.ceil(countdownDuration / 1000);

		// Update the button label with the remaining time
		abilityButton.text(remainingTime + 's');

		// Reduce the countdown duration
		countdownDuration -= 1000;

		// Check if the countdown has finished
		if (countdownDuration <= 0) {
			// Clear the countdown interval
			clearInterval(countdown);

			// Enable the button
			abilityButton.prop('disabled', false);

			// Reset the button label
			abilityButton.text('Slide');
			
			abilityButton.css('background-color', '#535353');
		}
		// Remove the breaking class from the player
		player.removeClass('breaking');
		$('#player').css('background-image','url(img/running2.gif)');
	  }, 1000);
	}

	$(document).on('keydown', function(e) {
		if (e.keyCode === 32 && !isJumping) {
			isJumping = true;
			jump();
		}
		if (e.keyCode === 67) { // 'C' key
			player.addClass('breaking');
			// Sliding
			$('#player').css('background-image','url(img/slide.png)');
		}
	});

	$(document).on('keyup', function(e) {
		if (e.keyCode === 67) { // 'C' key
			player.removeClass('breaking');
			// Running
			$('#player').css('background-image','url(img/running2.gif)');
		}
	});
	
	$('#jump-btn').on('click touchstart', function(e) {
		handleJump();
	});
	
	$('#attack-btn').on('click touchstart', function(e) {
		handleBreak();
	});
	
	/*
	$('#attack-btn').on('click touchstart', function(e) {
		player.addClass('breaking');
		$('#player').css('background-image','url(img/slide.png)');
	});
	
	$('#attack-btn').on('click touchend', function(e) {
		player.removeClass('breaking');
		$('#player').css('background-image','url(img/running2.gif)');
	});
	*/
	
	// Array of enemy images
	var enemyImages = [
	  'img/o1.png',
	  'img/o2.png',
	  'img/o3.png',
	  'img/o4.png'
	];

	// Function to get a random enemy image URL
	function getRandomEnemyImage() {
	  var randomIndex = Math.floor(Math.random() * enemyImages.length);
	  return enemyImages[randomIndex];
	}

	function createObstacle() {
		var obstacle = $('<div class="obstacle"></div>');
		obstacle.css('right', '0');
		obstacle.css('background-image', 'url(' + getRandomEnemyImage() + ')');
		//obstacle.css('bottom', getRandomHeight() + 'px');
		gameContainer.append(obstacle);
		obstacles.push(obstacle);
		setTimeout(createObstacle, obstacleInterval);
	}

	function createCoin() {  
		var coin = $('<div class="coin"></div>');
		coin.css('right', '0');
		coin.css('bottom', getRandomHeight() + 'px'); // Set random height
		gameContainer.append(coin);
		coins.push(coin);
		setTimeout(createCoin, coinInterval);
	}

	function getRandomHeight() {
		var minHeight = 50;
		var maxHeight = 130; // Adjust the maximum height as needed
		return Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
	}

	function updateScore() {
		$('#score').text(score);
	}
	
	function updateDistance() {
		distance += distanceInterval;
		var displayDistance = distance < 1000 ? distance + 'm' : (distance / 1000).toFixed(1) + 'km';
		$('#distance').text(displayDistance);
	}

	function startDistance() {
		setInterval(updateDistance, distanceInterval);
	}
	

	function gameOver() {
		//alert('Game Over!\nYour Score: ' + score + '\nTotal Distance: ' + distance + 'm');
		//location.reload();
		navigator.vibrate(50);
		//clearInterval(distanceInterval);
		$('#distance').hide();
		$('#score').hide();
		gameOverSound.play();
		$("#lose-link").click();
		$('#lose-text').text('Your Score: ' + score);
		$('#lose-text2').text('Total Distance: ' + distance + 'm');
	}
	
	function init() {
		updateScore();
		//moveBackground();
		moveObstacles();
		moveCoins();
		createObstacle();
		createCoin();
		startDistance();
	}
	
	init();
});

//Disable right click
document.addEventListener("contextmenu", function (e) {
	e.preventDefault();
}, false);

// Modal box
$(function() {
	$('a[rel*=leanModal]').leanModal({top : 200, closeButton: ".modal_close"});
});

// iOS link hack
if(("standalone" in window.navigator) && window.navigator.standalone){
	var noddy, remotes = false;
	document.addEventListener('click', function(event) {
		noddy = event.target;
		while(noddy.nodeName !== "A" && noddy.nodeName !== "HTML") {
	        noddy = noddy.parentNode;
	    }
		if('href' in noddy && noddy.href.indexOf('http') !== -1 && (noddy.href.indexOf(document.location.host) !== -1 || remotes))
		{
			event.preventDefault();
			document.location.href = noddy.href;
		}
	},false);
}