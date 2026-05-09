<template>
  <main class="legal-page">
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
useSeoMeta({
  title: 'Terms of Service — YourProject',
})
</script>

<style scoped>
  h4,h5,h6{ font-weight: bold; }
  h1{ font-size:2.5em; }
  h2{ font-size:1.5em; }
  h3{ font-size:1.5em; }
  h4{ font-size:1.2em; }
  h5{ font-size:1em; }
  h6{ font-size:0.9em; }

  blockquote{
  color:#666666;
  margin:0;
  padding-left: 3em;
  border-left: 0.5em #EEE solid;
  }
  hr { display: block; height: 2px; border: 0; border-top: 1px solid #aaa;border-bottom: 1px solid #eee; margin: 1em 0; padding: 0; }
  pre, code, kbd, samp { color: #000; font-family: monospace, monospace; _font-family: 'courier new', monospace; font-size: 0.98em; }
  pre { white-space: pre; white-space: pre-wrap; word-wrap: break-word; }

  b, strong { font-weight: bold; }

  dfn { font-style: italic; }

  ins { background: #ff9; color: #000; text-decoration: none; }

  mark { background: #ff0; color: #000; font-style: italic; font-weight: bold; }

  sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
  sup { top: -0.5em; }
  sub { bottom: -0.25em; }

  ul, ol { margin: 1em 0; padding: 0 0 0 2em; }
  li p:last-child { margin:0 }
  dd { margin: 0 0 0 2em; }

  img { border: 0; -ms-interpolation-mode: bicubic; vertical-align: middle; }

  table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  }
  th { border-bottom: 1px solid black; }
  td { vertical-align: top; }
  </style>