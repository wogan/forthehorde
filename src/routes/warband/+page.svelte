<script lang="ts">
    import { Character } from "$lib/model";

    let {data} = $props();

</script>

<table>
    <thead>
        <tr>
            <td>Name</td>
            <td>Class</td>
            <td>Race</td>
            <td>Level</td>
            <td>Gender</td>
            <td>Faction</td>
            <td>Spec</td>
            <td>Guild</td>
        </tr>
    </thead>
    <tbody>
	{#each data.characters as character}
		<tr>
            <td>{character.name}</td>
            <td>{character.level}</td>
        </tr>
	{/each}
    </tbody>
</table>