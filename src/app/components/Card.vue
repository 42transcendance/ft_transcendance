<script setup lang="ts">
defineProps({
    title: String
})
</script>

<template>
    <div class="w-full h-full flex items-center">
    <div class="bg-blue-50/90 max-w-200 w-full m-auto p-18 flex flex-col items-center align-middle rounded-md">
        <h1 class="text-blue-900 text-xl text-center mb-">{{ title }}</h1>
        <slot />
    </div>
    </div>
</template>