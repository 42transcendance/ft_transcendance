export const useChat = () => {
    const isChatOpen = useState('isChatOpen', () => false)

    const openChat = () => {
        isChatOpen.value = true
    }

    const closeChat = () => {
        isChatOpen.value = false
    }

    const toggleChat = () => {
        isChatOpen.value = !isChatOpen.value
    }

    return {
        isChatOpen,
        openChat,
        closeChat,
        toggleChat
    }
}