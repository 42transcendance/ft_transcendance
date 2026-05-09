<template>
  <main class="legal-page">
    <h1>Privacy Policy</h1>
    <p class="last-updated">Last updated: June 2026</p>

    <section>
      <h2>1. Introduction</h2>
      <p>
        "Pixel Fight" is a web application developed as part of the ft_transcendence
        project at 42 School. This policy explains what data we collect and how we use it.
      </p>
    </section>

    <section>
      <h2>2. Data We Collect</h2>
      <ul>
        <li><strong>Account data:</strong> email address, username, hashed password</li>
        <li><strong>Profile data:</strong> avatar, username</li>
        <li><strong>Game data:</strong> match history, scores, win/loss statistics</li>
        <li><strong>Chat data:</strong> messages sent in public or private chats</li>
        <li><strong>Session data:</strong> authentication tokens, last login timestamp</li>
      </ul>
    </section>

    <section>
      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>Authenticate you and manage your session</li>
        <li>Display your profile (only your username) and your connection status</li>
        <li>Enable real-time gameplay and matchmaking</li>
        <li>Operate the chat system</li>
      </ul>
    </section>

    <section>
      <h2>4. Data Security</h2>
      <p>
        All communications are encrypted via HTTPS. Passwords are hashed using bcrypt
        and never stored in plain text. Access to the database is restricted to the
        application backend only.
      </p>
    </section>

    <section>
      <h2>5. Data Sharing</h2>
      <p>
        We do not sell or share your personal data with third parties. Your username
        and game statistics are visible to other registered users within the application.
      </p>
    </section>

    <section>
      <h2>6. Cookies and Sessions</h2>
      <p>
        We use HTTP-only cookies to store your authentication token (JWT). 
        Cookies expire after 7 days and are transmitted over HTTPS only 
        in production. They are never accessible via JavaScript.
      </p>
    </section>

    <section>
      <h2>7. Your Rights</h2>
      <p>
        You may delete your account at any time from your profile settings. Deletion
        removes all personal data associated with your account.
      </p>
    </section>

    <section>
      <h2>8. Contact</h2>
      <p>
        For any questions regarding this policy, open an issue on our
        <a href="https://github.com/42transcendance" target="_blank" rel="noopener">GitHub repository</a>.
      </p>
    </section>
  </main>
</template>

<script setup>
useSeoMeta({
  title: 'Privacy Policy — YourProject',
})
</script>

<style scopedd>
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