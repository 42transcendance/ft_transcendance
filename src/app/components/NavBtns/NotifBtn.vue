<script setup lang="ts">
const { pendingReceived, respondRequest, fetchFriends } = useFriends()
const { openProfile } = useProfile()

const showPopup = ref(false)

// Liste locale pour gérer les animations de disparition
const localRequests = ref<any[]>([])
const dismissing = ref<Set<string>>(new Set())

// Synchronise localRequests avec pendingReceived
watch(pendingReceived, (newVal) => {
    // Ajoute les nouveaux, ne supprime pas ceux en cours de disparition
    localRequests.value = newVal.filter(
        r => !dismissing.value.has(r.friendshipId)
    )
}, { immediate: true, deep: true })

const pendingCount = computed(() => pendingReceived.value.length)

async function handleRespond(friendshipId: string, action: 'ACCEPTED' | 'DECLINED') {
    // 1. Lance l'animation de disparition
    dismissing.value = new Set([...dismissing.value, friendshipId])
    localRequests.value = localRequests.value.filter(r => r.friendshipId !== friendshipId)

    // 2. Attend la fin de l'animation (300ms) puis appelle l'API
    await new Promise(resolve => setTimeout(resolve, 300))
    await respondRequest(friendshipId, action)
    dismissing.value.delete(friendshipId)
}
</script>

<template>
    <div class="notif-wrapper">
        <!-- La cloche — visible seulement si demandes en attente -->
        <Transition name="bounce">
			<button
				v-if="pendingCount > 0"
				class="bell-btn"
				@click="showPopup = true">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
					<path d="M13.73 21a2 2 0 0 1-3.46 0"/>
				</svg>
				<span class="badge">{{ pendingCount }}</span>
			</button>
        </Transition>

        <!-- Overlay + Popup -->
        <div v-if="showPopup" class="overlay" @click.self="showPopup = false">
            <div class="popup">
                <h3>Friend Requests</h3>
                <p v-if="localRequests.length === 0" class="empty">No pending requests</p>
                <TransitionGroup name="slide-out" tag="div" class="requests-list">
                    <div
                        v-for="req in localRequests"
                        :key="req.friendshipId"
                        class="request-card">
                        <img
                            :src="req.user.avatarUrl || '/default-avatar.jpg'"
                            class="req-avatar"
                            @click="showPopup = false; openProfile({ safeUser: req.user })"
                        />
                        <span
                            class="req-username"
                            @click="showPopup = false; openProfile({ safeUser: req.user })">
                            {{ req.user.username }}
                        </span>
                        <div class="req-actions">
                            <button @click="handleRespond(req.friendshipId, 'ACCEPTED')" class="accept-btn">✓</button>
                            <button @click="handleRespond(req.friendshipId, 'DECLINED')" class="decline-btn">✗</button>
                        </div>
                    </div>
                </TransitionGroup>
                <button class="close-popup-btn" @click="showPopup = false">Close</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notif-wrapper {
    position: fixed;
    top: 70px;
    left: 20px;
    z-index: 2500;
}

.bell-btn {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: white;
    border: none;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: box-shadow 0.2s;
}

.bell-btn:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.25);
}

.badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #e32b2b;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: normal;
}

/* Animation de la cloche — bounce depuis la gauche */
.bounce-enter-active {
    animation: bounce-in 0.5s;
}
.bounce-leave-active {
    animation: bounce-in 0.3s reverse;
}
@keyframes bounce-in {
    0%   { transform: translateX(-30px); opacity: 0; }
    60%  { transform: translateX(6px);   opacity: 1; }
    80%  { transform: translateX(-3px); }
    100% { transform: translateX(0); }
}

/* Animation de disparition des cartes — glissement droite */
.slide-out-leave-active {
    transition: all 0.3s ease;
}
.slide-out-leave-to {
    transform: translateX(120%);
    opacity: 0;
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4000;
}

.popup {
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    max-height: 500px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.popup h3 {
    text-align: center;
    margin: 0;
}

.empty {
    text-align: center;
    color: #aaa;
    font-style: italic;
}

.requests-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;  /* nécessaire pour que le glissement ne déborde pas */
}

.request-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 8px;
}

.req-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid #ddd;
    flex-shrink: 0;
}

.req-username {
    flex-grow: 1;
    font-weight: bold;
    cursor: pointer;
}
.req-username:hover {
    text-decoration: underline;
}

.req-actions {
    display: flex;
    gap: 8px;
}

.accept-btn {
    background: #42b883;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
}
.accept-btn:hover { background: #369a6e; }

.decline-btn {
    background: #e32b2b;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
}
.decline-btn:hover { background: #b52020; }

.close-popup-btn {
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px;
    cursor: pointer;
    color: #888;
    align-self: center;
}
.close-popup-btn:hover { background: #f5f5f5; }
</style>
