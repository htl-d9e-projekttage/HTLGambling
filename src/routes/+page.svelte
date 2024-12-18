<script lang="ts">
  import { Heading, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import type { PageServerData } from './$types';
  let { data }: { data: PageServerData } = $props();
</script>

<Heading class="font-inta font-semibold text-2xl">Welcome to HTL-Gambling, {data.user.username}</Heading>
<div class="flex justify-center">
  <div>
    <Heading tag="h3" class="mb-4 text-center">Leaderboard</Heading>
    <Table>
      <TableHead>
        <TableHeadCell>Username</TableHeadCell>
        <TableHeadCell>Money</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each data.leaderboardData as user}
          <TableBodyRow>
            <TableBodyCell>{user.username}</TableBodyCell>
            <TableBodyCell>€ {user.money / 100}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>
</div>