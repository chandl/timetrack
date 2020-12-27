<script>
	import Times from "./Times.svelte";
	import Navbar from "./Navbar.svelte";

	let times;
</script>

<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">



<main>
	<Navbar />
	<h1>Time Tracker</h1>
	<Times {times}/>
</main>
