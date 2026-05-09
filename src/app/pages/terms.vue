<template>
  <main class="legal">
    <h1>Terms of Service</h1>
    <p class="last-updated">Last updated: June 2026</p>

    <section>
      <h2>1. Acceptance</h2>
      <p>
        By creating an account on "Pixel Fight", you agree to these Terms of Service.
        If you do not agree, please do not use the application.
      </p>
    </section>

    <section>
      <h2>2. Description of Service</h2>
      <p>
        "Pixel Fight" is a real-time multiplayer web application developed for educational
        purposes as part of the 42 School curriculum. It allows users to play our application and interact with other users via chat.
      </p>
    </section>

    <section>
      <h2>3. Account Rules</h2>
      <ul>
        <li>One account per person</li>
        <li>You must provide a valid email address</li>
        <li>You are responsible for keeping your credentials secure</li>
        <li>Sharing or selling your account is prohibited</li>
      </ul>
    </section>

    <section>
      <h2>4. Acceptable Use</h2>
      <ul>
        <li>No cheating, exploiting bugs, or using bots</li>
        <li>No offensive, hateful, or harassing content in chat</li>
        <li>No attempts to compromise the security of the application</li>
      </ul>
    </section>

    <section>
      <h2>5. Intellectual Property</h2>
      <p>
        The source code for this project is available under the MIT License.
        All original assets and designs remain the property of the development team.
      </p>
    </section>

    <section>
      <h2>6. Disclaimer</h2>
      <p>
        This application is provided for educational purposes with no guarantee of
        uptime or data persistence. We reserve the right to reset or shut down the
        service at any time.
      </p>
    </section>

    <section>
      <h2>7. Account Termination</h2>
      <p>
        We reserve the right to suspend or delete any account that violates these terms.
        You may also delete your own account at any time from your profile settings.
      </p>
    </section>
  </main>
</template>

<script setup>
useHead({
	title: 'Terms'
})

useSeoMeta({
  title: 'Terms of Service — YourProject',
})
</script>

<style scoped>
  @import '../assets/css/legal.css'
</style>
