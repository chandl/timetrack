<script>
    import { onMount } from "svelte";
    // import Time from "./Time.svelte";
    import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
    import Checkbox from '@smui/checkbox';

    let times;

    onMount(async () => {
        await fetch(`http://localhost:3000/time`)
            .then(res => res.json())
            .then(data => {
                times = data;
            });
    })

    let selectedTimes = [];
</script>

<section>
{#if times}
    <DataTable table$aria-label="Time Tracker">
        <Head>
            <Row>
                <Cell checkbox>
                    <Checkbox />
                </Cell>
                <Cell>Date</Cell>
                <Cell>Customer</Cell>
                <Cell>SvcItem</Cell>
                <Cell>Time</Cell>
                <Cell>Notes</Cell>
                <Cell>Billable</Cell>
                <Cell>Actions</Cell>
            </Row>
        </Head>
        <Body>
            {#each times as time}
            <Row>
                <Cell checkbox>
                    <Checkbox bind:group={selectedTimes} value={time} valueKey={times.id} />
                </Cell>
                <Cell>{time.day}</Cell>
                <Cell>{time.customer}</Cell>
                <Cell>{time.serviceItem}</Cell>
                <Cell numeric>{time.minutes}</Cell>
                <Cell>{time.notes}</Cell>
                <Cell>{time.billable}</Cell>
                <Cell>actions</Cell>
            </Row>
            {/each}
        </Body>
    </DataTable>
    
    <pre class="status">Selected: {selectedTimes.map(times => times.id).join(', ')}</pre>
    <pre class="status">Total Time: {selectedTimes.map(t => t.minutes).reduce((a, b) => a + b, 0)}</pre>
{:else}
    <p class="loading">loading...</p>
{/if}
</section>