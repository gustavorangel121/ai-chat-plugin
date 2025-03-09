// options/options.js
document.addEventListener('DOMContentLoaded', function() {
    const chatbotsContainer = document.getElementById('chatbots-container');
    const addChatbotButton = document.getElementById('add-chatbot');
    const saveButton = document.getElementById('save-button');
    const resetButton = document.getElementById('reset-button');

    let chatbots = [];

    // Load saved chatbots
    browser.storage.sync.get('chatbots').then((result) => {
      chatbots = result.chatbots || getDefaultChatbots();
      renderChatbots();
    });

    // Add a new chatbot
    addChatbotButton.addEventListener('click', function() {
      chatbots.push({
        name: '',
        url: ''
      });
      renderChatbots();
    });

    // Save chatbots
    saveButton.addEventListener('click', function() {
      // Collect data from inputs
      const chatbotItems = document.querySelectorAll('.chatbot-item');
      const updatedChatbots = [];

      chatbotItems.forEach((item) => {
        const nameInput = item.querySelector('.chatbot-name');
        const urlInput = item.querySelector('.chatbot-url');

        const name = nameInput.value.trim();
        const url = urlInput.value.trim();

        if (name && url) {
          updatedChatbots.push({
            name: name,
            url: url
          });
        }
      });

      // Save to storage
      browser.storage.sync.set({ chatbots: updatedChatbots }).then(() => {
        chatbots = updatedChatbots;
        showSavedMessage();
      });
    });

    // Reset to defaults
    resetButton.addEventListener('click', function() {
      if (confirm('Reset to default chatbots? This will remove all custom chatbots.')) {
        chatbots = getDefaultChatbots();
        browser.storage.sync.set({ chatbots: chatbots }).then(() => {
          renderChatbots();
          showSavedMessage();
        });
      }
    });

    function renderChatbots() {
      chatbotsContainer.innerHTML = '';

      chatbots.forEach((chatbot, index) => {
        const chatbotItem = document.createElement('div');
        chatbotItem.className = 'chatbot-item';

        chatbotItem.innerHTML = `
          <input type="text" class="chatbot-name" placeholder="Chatbot Name" value="${escapeHTML(chatbot.name)}">
          <input type="text" class="chatbot-url" placeholder="URL with {prompt}" value="${escapeHTML(chatbot.url)}">
          <button class="delete" data-index="${index}">Remove</button>
        `;

        chatbotsContainer.appendChild(chatbotItem);
      });

      // Add event listeners for delete buttons
      const deleteButtons = document.querySelectorAll('button.delete');
      deleteButtons.forEach((button) => {
        button.addEventListener('click', function() {
          const index = parseInt(button.getAttribute('data-index'));
          chatbots.splice(index, 1);
          renderChatbots();
        });
      });
    }

    function showSavedMessage() {
      const message = document.createElement('div');
      message.textContent = 'Settings saved!';
      message.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #12bc00; color: white; padding: 8px 16px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);';
      document.body.appendChild(message);

      setTimeout(() => {
        message.remove();
      }, 3000);
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

    function escapeHTML(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  });
