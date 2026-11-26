<script>
  import { ArrowRight } from 'lucide-svelte';
  export let product = 'Flowly';
  const plans = ['Starter', 'Team'];
</script>

<section class="hero">
  <div class="stars">★★★★★</div>
  <h1>{product} keeps your projects moving</h1>
  <div class="actions">
    <a class="btn rounded-full bg-violet-600 px-6 py-3 text-white" href="/signup">Start free <ArrowRight /></a>
    <a class="btn rounded-full border px-6 py-3" href="/tour">Explore</a>
  </div>
  {#each plans as plan}
    <span>{plan}</span>
  {/each}
</section>
