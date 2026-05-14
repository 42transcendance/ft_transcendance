<script setup lang="ts">
const { currentUser, logout } = useAuth()
const { toggleChat } = useChat()
</script>

<template>
  <nav class="fixed w-full bg-white/90 shrink-1 p-2 pl-8 pr-8 z-2 flex flex-col">
    <div class="flex flex-row sm:justify-between justify-center items-center gap-2 flex-wrap sm:flex-nowrap order-3 sm:order-none">
      <div class="flex flex-row gap-8 items-center order-1 sm:order-1">
        <NuxtLink aria-label="Homepage" class="w-12 h-12 flex items-center justify-center" to="/">
          <svg alt="Logo" class="w-full h-full fill-blue-800 hover:fill-blue-900" viewBox="0 0 56 27"
            xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1,0,0,1,-399.87985,-646.740975)">
              <g transform="matrix(4.463317,0,0,4.641442,-585.149718,-2444.719592)">
                <path
                  d="M223.222,671.47L221.015,671.596L220.695,666.408L223.967,666.221C224.266,666.204 224.544,666.243 224.8,666.339C225.057,666.435 225.268,666.614 225.435,666.877C225.601,667.141 225.699,667.513 225.729,667.993C225.758,668.465 225.704,668.843 225.567,669.128C225.43,669.413 225.24,669.623 224.997,669.756C224.755,669.889 224.489,669.964 224.199,669.981L223.134,670.041L223.222,671.47ZM223.554,667.955L222.881,667.994L222.903,668.357L223.597,668.318C223.634,668.316 223.675,668.302 223.718,668.277C223.761,668.252 223.78,668.204 223.775,668.132C223.771,668.055 223.742,668.006 223.689,667.985C223.636,667.963 223.591,667.953 223.554,667.955Z" />
                <path
                  d="M230.487,666.231L230.445,667.885L228.361,667.835L228.354,668.112L230.375,668.16L230.337,669.631L228.316,669.583L228.27,671.378L226.06,671.326L226.193,666.13L230.487,666.231Z" />
                <path
                  d="M232.64,669.818L230.821,669.67C230.827,669.553 230.83,669.38 230.832,669.152C230.833,668.924 230.836,668.668 230.839,668.384C230.843,668.1 230.85,667.81 230.859,667.515C230.869,667.22 230.88,666.945 230.894,666.688C230.907,666.432 230.923,666.223 230.942,666.062L230.949,666.056L233.145,666.235L233.138,666.241C233.133,666.403 233.115,666.612 233.083,666.866C233.051,667.121 233.014,667.395 232.972,667.687C232.93,667.98 232.887,668.267 232.843,668.551C232.799,668.834 232.759,669.087 232.723,669.31C232.687,669.533 232.659,669.702 232.64,669.818ZM232.571,670.605L232.523,671.143C232.508,671.313 232.423,671.453 232.268,671.562C232.113,671.672 231.877,671.713 231.56,671.688C231.247,671.662 231.022,671.581 230.884,671.443C230.746,671.305 230.684,671.151 230.699,670.981L230.746,670.449C230.761,670.279 230.848,670.137 231.009,670.024C231.169,669.91 231.405,669.866 231.718,669.892C232.035,669.918 232.26,669.997 232.394,670.13C232.528,670.262 232.587,670.421 232.571,670.605Z" />
              </g>
            </g>
          </svg>
        </NuxtLink>
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-950" to="/game" aria-label="Go to game">
          <span class="sm:hidden"><i class="fa-solid fa-gamepad"></i></span>
          <span class="hidden sm:inline">Play</span>
        </NuxtLink>
      </div>

      <div class="flex gap-2 order-2 sm:order-3">
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-950"
          v-if="!currentUser" to="/login" aria-label="Login page"><span class="sm:hidden"><i class="fa-solid fa-arrow-right-to-bracket"></i></span>
          <span class="hidden sm:inline">Login</span></NuxtLink>
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-950"
          v-if="!currentUser" to="/signup" aria-label="Sign up page"><span class="sm:hidden"><i class="fa-solid fa-user-plus"></i></span>
          <span class="hidden sm:inline">Sign up</span></NuxtLink>
        <button class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-950"
          v-if="currentUser" @click="toggleChat" aria-label="Toggle chat"><span class="sm:hidden"><i class="fa-solid fa-comment"></i></span>
          <span class="hidden sm:inline">Chat</span></button>
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-950"
          v-if="currentUser" :to="`/profile/${currentUser?.id}`" aria-label="Go to profile"><span class="sm:hidden"><i class="fa-solid fa-circle-user"></i></span>
          <span class="hidden sm:inline">Profile</span></NuxtLink>
        <button v-if="currentUser" @click="logout" aria-label="Logout"
          class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-950 p-0"><span class="sm:hidden"><i class="fa-solid fa-arrow-right-from-bracket"></i></span>
          <span class="hidden sm:inline">Logout</span></button>
      </div>

      <NavBtnsSearchBar v-if="currentUser" class="search-bar order-3 sm:order-2 w-full sm:w-auto" />
    </div>
  </nav>
</template>

<style scoped></style>
