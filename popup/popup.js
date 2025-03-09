// popup/popup.js
document.addEventListener('DOMContentLoaded', function() {
    const chatbotSelector = document.getElementById('chatbot-selector');
    const promptInput = document.getElementById('prompt-input');
    const launchButton = document.getElementById('launch-button');

    // Load saved chatbots and populate the dropdown
    browser.storage.sync.get('chatbots').then((result) => {
      const chatbots = result.chatbots || getDefaultChatbots();

      chatbots.forEach((chatbot) => {
        const option = document.createElement('option');
        option.value = chatbot.url;
        option.textContent = chatbot.name;
        chatbotSelector.appendChild(option);
      });
    });

    // Handle button click
    launchButton.addEventListener('click', launchChatbot);

    // Handle Enter key
    promptInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        launchChatbot();
      }
    });

    // Focus the input field when popup opens
    promptInput.focus();

    function launchChatbot() {
      const selectedChatbotUrl = chatbotSelector.value;
      const prompt = promptInput.value.trim();

      if (!prompt) {
        return;
      }

      browser.storage.sync.get('chatbots').then((result) => {
        const chatbots = result.chatbots || getDefaultChatbots();
        const selectedChatbot = chatbots.find(c => c.url === selectedChatbotUrl);

        if (selectedChatbot) {
          // Format the URL with the prompt
          const formattedUrl = formatUrl(selectedChatbot, prompt);

          // Check if current tab is empty or create a new tab
          browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            const currentTab = tabs[0];

            if (currentTab.url === 'about:blank' || currentTab.url === 'about:newtab') {
              browser.tabs.update(currentTab.id, {url: formattedUrl});
            } else {
              browser.tabs.create({url: formattedUrl});
            }
          });
        }
      });
    }

    function formatUrl(chatbot, prompt) {
      return chatbot.url.replace('{prompt}', encodeURIComponent(prompt));
    }

    function getDefaultChatbots() {
      return [
        {
          name: 'ChatGPT',
          url: 'https://chat.openai.com/?prompt={prompt}'
        },
        {
          name: 'Claude',
          url: 'https://claude.ai/chat?prompt={prompt}'
        },
        {
          name: 'Qwen',
          url: 'https://tongyi.aliyun.com/?prompt={prompt}'
        }
      ];
    }
  });
